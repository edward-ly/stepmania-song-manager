import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import md5File from 'md5-file'
import EventEmitter from 'events'
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import readDirRecursive from '../helpers/readDirRecursive'

async function listBucket (s3Client, bucket, songListOnly) {
  let continuationToken = undefined
  let contents = []

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket.name,
      ContinuationToken: continuationToken,
    })

    const res = await s3Client.send(listCommand)
    let newContents = res.Contents
    if (songListOnly) newContents = newContents.filter(item => {
      const ext = path.extname(item.Key)
      return _.includes(['.sm', '.ssc', '.ini'], ext)
    })
    contents = contents.concat(newContents)
    continuationToken = res.NextContinuationToken
  } while (continuationToken)

  return contents.map(item => {
    const localPath = path.join(bucket.localPath, item.Key)
    return {...item, LocalPath: localPath}
  })
}

export default async function s3Download (event, bucket, credentials, songListOnly) {
  const ee = new EventEmitter()
  ee.on('error', (err) => event.reply('sync-error', err))
  ee.on('progress', (progress) => event.reply('sync-progress', progress))
  ee.on('end', () => event.reply('sync-end'))

  let progressAmount = 0
  let progressTotal = 0
  ee.emit('progress', NaN)

  const bucketName = bucket.name
  const downloadPath = bucket.localPath

  let s3Params = {
    region: bucket.region || 'us-west-2',
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
    },
  }
  if (bucket.endpoint) s3Params.endpoint = bucket.endpoint
  if (credentials.SessionToken) s3Params.sessionToken = credentials.SessionToken
  const s3Client = new S3Client(s3Params)


  try {
    await fs.ensureDir(downloadPath)
    let localContents = readDirRecursive(downloadPath)
    let s3Contents = await listBucket(s3Client, bucket, songListOnly)
    const newContents = s3Contents.filter(item => !localContents.includes(item.LocalPath))
    _.pullAll(s3Contents, newContents)
    progressTotal = localContents.length + newContents.length
    ee.emit('progress', progressAmount / progressTotal)

    while (localContents.length) {
      const localFile = localContents.shift()
      const contentIndex = s3Contents.findIndex(item => item.LocalPath === localFile)

      if (contentIndex > -1) {
        const content = _.head(s3Contents.splice(contentIndex, 1))
        const localHash = await md5File(localFile)

        if (!content.ETag.includes(localHash)) {
          const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: content.Key,
          })

          const res = await s3Client.send(getCommand)
          res.Body.pipe(fs.createWriteStream(localFile))
        }
      }
      else {
        await fs.rm(localFile)
      }

      progressAmount++
      ee.emit('progress', progressAmount / progressTotal)
    }

    for (let content of newContents) {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: content.Key,
      })

      const res = await s3Client.send(getCommand)
      const localPath = content.LocalPath
      await fs.ensureFile(localPath)
      res.Body.pipe(fs.createWriteStream(localPath))

      progressAmount++
      ee.emit('progress', progressAmount / progressTotal)
    }

    ee.emit('end')
  } catch (err) {
    ee.emit('error', err)
  }
}
