import _ from 'lodash'

/**
 * Helper functions for grabbing song/pack metadata from StepMania files.
 */

function getChartLevel (data, fileExtension, style, difficulty) {
  let matchStr = 'a^'
  if (fileExtension === '.sm') {
    matchStr = `(?<=#NOTES:\\s*${style}:\\s*.*:\\s*${difficulty}:\\s*)\\d+`
  }
  if (fileExtension === '.ssc') {
    matchStr = `(?<=#STEPSTYPE:${style};\\s*(.*\\s*){0,2}#DIFFICULTY:${difficulty};\\s*#METER:)\\d+`
  }
  const match = data.match(new RegExp(matchStr))
  return !match ? '-' : match[0]
}

function getDisplayBPM (data) {
  const displayBpmMatch = data.match(/(?<=#DISPLAYBPM:).*(?=;\s*#BPMS:)/)
  const displayBPM = !displayBpmMatch ? '' : displayBpmMatch[0]
  if (!displayBPM) {
    const trueBPMs = data
      .match(/(?<=#BPMS:)[^;]*(?=;)/)[0]
      .replace(/\s+/g, '')
      .split(',')
      .map((entry) => Number(entry.substring(entry.indexOf('=') + 1)))
    const minBPM = _.round(_.min(trueBPMs))
    const maxBPM = _.round(_.max(trueBPMs))
    return minBPM === maxBPM ? `${maxBPM}` : `${minBPM}-${maxBPM}`
  }
  if (displayBPM === '*') return '???'
  const bpms = displayBPM.split(':')
  const minBPM = _.round(Number(bpms[0]))
  if (bpms.length > 1) {
    const maxBPM = _.round(Number(bpms[1]))
    return `${minBPM}-${maxBPM}`
  }
  return minBPM.toString()
}

function getSimfileField (data, field) {
  const match = data.match(new RegExp(`(?<=#${field}:).*(?=;)`))
  return !match ? '' : match[0]
}

function parseSimfileData (data, fileExtension) {
  if (!_.includes(['.sm', '.ssc'], fileExtension)) return {}

  return {
    title: getSimfileField(data, 'TITLE'),
    subtitle: getSimfileField(data, 'SUBTITLE'),
    artist: getSimfileField(data, 'ARTIST'),
    titleTranslit: getSimfileField(data, 'TITLETRANSLIT'),
    subtitleTranslit: getSimfileField(data, 'SUBTITLETRANSLIT'),
    artistTranslit: getSimfileField(data, 'ARTISTTRANSLIT'),
    // genre: getSimfileField(data, 'GENRE'),
    displayBPM: getDisplayBPM(data),
    begLevel: getChartLevel(data, fileExtension, 'dance-single', 'Beginner'),
    bspLevel: getChartLevel(data, fileExtension, 'dance-single', 'Easy'),
    dspLevel: getChartLevel(data, fileExtension, 'dance-single', 'Medium'),
    espLevel: getChartLevel(data, fileExtension, 'dance-single', 'Hard'),
    cspLevel: getChartLevel(data, fileExtension, 'dance-single', 'Challenge'),
    spEditLevel: getChartLevel(data, fileExtension, 'dance-single', 'Edit'),
    bdpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Easy'),
    ddpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Medium'),
    edpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Hard'),
    cdpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Challenge'),
    dpEditLevel: getChartLevel(data, fileExtension, 'dance-double', 'Edit'),
  }
}

export { getChartLevel, getDisplayBPM, getSimfileField, parseSimfileData }
