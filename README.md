# StepMania Song Manager

[![build](https://github.com/edward-ly/stepmania-song-manager/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/edward-ly/stepmania-song-manager/actions/workflows/main.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A cross-platform utility app for [StepMania](https://github.com/stepmania/stepmania) that downloads and automatically updates song ("simfile") packs hosted in Amazon S3 buckets (or any bucket that can interact with the S3 API).

Made with [Electron](https://www.electronjs.org/) and [Vue.js](https://vuejs.org/) via the [Quasar](https://quasar.dev/) framework.

## Available Songs

Current list of downloadable packs (officially supported and maintained by me):

-   [DanceDanceRevolution (Arcade)](https://p.eagate.573.jp/game/ddr/ddra20/p/index.html) - Aims to replicate the DDR arcade experience with a song list that mirrors that of the DDR A20 PLUS song list (meaning that future updates will include both song additions and song removals).
-   [The Complete led_light Collection](https://zenius-i-vanisher.com/v5.2/viewsimfilecategory.php?categoryid=821) - A continuously growing collection of DDR-style simfiles made by me!
    Recommended for beginners with a wide variety of popular songs!
-   [led_light's Tech Experiments](https://zenius-i-vanisher.com/v5.2/viewsimfilecategory.php?categoryid=821) - A separate collection of ITG-style simfiles made by me.
    Not recommended for beginners.

## Development

```bash
# Install dependencies
yarn

# Start app in development mode (hot-code reloading, error reporting, etc.)
yarn dev

# Lint files
yarn lint

# Build app for production
yarn build
```

### Contributing

Want to help make the app better?
Feel free to fork the repository, make changes, and create a pull request!
Just make sure that your pull requests target the `develop` branch only.

## Using the App

### Adding Song Packs

Simply click on the `+ Add Songs` button and select a bucket from the list.
You can also add a new S3 bucket that is not already in the list, in which case the name of the S3 bucket is required.
For buckets hosted outside of Amazon, the endpoint URL of the bucket is required as well.

Once selected, the chosen bucket will then be displayed on the main page where you can view the songs in the bucket, download all files in the bucket, or remove the bucket from the app.

> *Note: Removing a bucket from the app will only hide the songs from StepMania, and not delete any local files from your computer.
  This is to prevent re-downloading any files unnecessarily should you decide to re-add the bucket.
  If you want to completely remove the downloaded packs from your computer, you can manually delete the files and folders yourself.*

### Updating Song Packs

Once downloaded, all song packs will automatically be detected and playable in StepMania the next time you run the game (as the download path for each bucket is automatically added to the `AdditionalSongFolders` variable in StepMania's `Preferences.ini` file).

The packs will also be updated automatically as long as the app is open or running in the background.
The app itself will check for and download updates periodically, or you can perform a manual update by clicking on the `Update` button for each bucket.

### Settings

The settings page includes the following parameters, which are set to their default values when the app is launched for the first time.
Any changes made to these settings will be saved automatically.

| Name | Default Value | Description |
| :- | :- | :- |
| `Download Path` | (See below.) | The directory in which song packs will be downloaded. Only applies to newly added packs. |
| `Preferences.ini Path` | Paths to all `Preferences.ini` files automatically found/detected. | The full path to the `Preferences.ini` file used by StepMania (or paths if multiple copies of StepMania are installed). |
| `Update Frequency` | `1 hour` | How often the app will check for and download updates. |
| `Auto-Launch on Login` | `false` | Whether or not to open the app when the computer starts. |
| `Language` | `English (United States)` | Language of the app's user interface. |

Default download paths:

-   Windows: `%APPDATA%/StepMania Song Manager/Songs`
-   macOS: `~/Library/Application Support/StepMania Song Manager/Songs`
-   Linux:
    -   `$XDG_CONFIG_HOME/StepMania Song Manager/Songs`, or
    -   `~/.config/StepMania Song Manager/Songs`

## Adding New Packs

If you want to upload your own simfile packs for others to freely download with the app, you can follow the steps for each cloud storage provider below.

> Note: Regardless of the server to which you want to upload your packs, the files in the bucket must follow this directory structure: `/<pack-name>/<song-name>/<song-files>`.
Otherwise, StepMania will not be able to recognize the simfiles from the app.

### Amazon S3

1. Create an AWS account if you haven't already.
   [Creating an IAM admin user](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html) is also recommended for interacting with AWS.
2. Create a new bucket from the Amazon S3 web console.
   The name of the bucket must contain only lowercase letters, numbers, and hyphens.
3. Configure the bucket to allow public access.
   From the Amazon S3 console, uncheck "Block *all* public access" and (optionally) re-check "Block public access to buckets and objects granted through [*new* & *any*] access control lists (ACLs)".
4. Add the following JSON to the bucket policy, replacing `<bucket-name>` with the bucket name.
   After this step, your bucket should now be public and ready for download from the app!

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<bucket-name>",
                "arn:aws:s3:::<bucket-name>/*"
            ]
        }
    ]
}
```

5. Install and configure [AWS CLI](https://aws.amazon.com/cli/) if you haven't already, using the Access Key ID and Secret Access Key of your IAM admin user account.

```sh
aws configure --profile <any-profile-name>
```

6. Configure AWS CLI to prevent uploading large files in multiple parts.

```sh
aws configure set s3.multipart_threshold 128MB --profile <any-profile-name>
```

Feel free to change `128MB` to whatever size you want, but make sure it is larger than the size of the largest file you intend to upload.

7. Upload your files to the bucket:

```sh
aws s3 sync </path/to/packs> s3://<bucket-name> --delete --profile <any-profile-name>
```

## Donate

Like the app?
Please consider donating, which will help pay for the costs of hosting and downloading simfiles online.

[![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=R3F883NUQFLP2)

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z42UJNY)

## License

See [LICENSE](./LICENSE) for details.
