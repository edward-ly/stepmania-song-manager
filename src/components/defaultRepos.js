const defaultRepos = [
  {
    name: 'DanceDanceRevolution (Arcade)',
    bucketName: 'ddr-arcade-simfiles',
    endpoint: 'https://s3.us-west-000.backblazeb2.com',
    region: 'us-west-000',
    description:
      'The latest official arcade release of DDR, with all songs grouped by mix in chronological order. Will include new songs, rating adjustments, songs removals, etc. as the arcade game is updated. Source files: https://zenius-i-vanisher.com/v5.2/simfiles.php?category=simfiles',
  },
  // {
  //   name: 'DanceDanceRevolution XX',
  //   bucketName: 'ddr-xx-simfiles',
  //   endpoint: 'https://s3.us-west-000.backblazeb2.com',
  //   region: 'us-west-000',
  //   description:
  //     'A 20th anniversary celebration of DDR. By Zenius, for Zenius.',
  // },
  {
    name: 'The Complete led_light Collection',
    bucketName: 'led-light-simfiles',
    endpoint: 'https://s3.us-west-000.backblazeb2.com',
    region: 'us-west-000',
    description:
      'DDR custom simfiles from the creator of StepMania Song Manager. More info: https://zenius-i-vanisher.com/v5.2/viewsimfilecategory.php?categoryid=821',
  },
  {
    name: "led_light's Tech Experiments",
    bucketName: 'led-light-simfiles-itg',
    endpoint: 'https://s3.us-west-000.backblazeb2.com',
    region: 'us-west-000',
    description:
      'ITG tech-style charts from the creator of StepMania Song Manager. More info: https://zenius-i-vanisher.com/v5.2/viewsimfilecategory.php?categoryid=821',
  },
]

export default defaultRepos
