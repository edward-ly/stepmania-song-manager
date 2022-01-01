import path from 'path'
import fs from 'fs-extra'

// Based on the 'fs-readdir-recursive' npm package, modified for this app
// https://github.com/fs-utils/fs-readdir-recursive

export default function readDirRecursive (root, files, prefix) {
  files = files || []
  prefix = prefix || ''

  let dir = path.join(root, prefix)
  if (!fs.existsSync(dir)) return files
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
      .filter((name) => name[0] !== '.')
      .forEach((name) => readDirRecursive(root, files, path.join(prefix, name)))
  } else {
    files.push(dir)
  }

  return files
}
