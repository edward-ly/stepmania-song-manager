# StepMania Song Manager

[![build](https://github.com/edward-ly/stepmania-song-manager/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/edward-ly/stepmania-song-manager/actions/workflows/main.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A cross-platform utility app for [StepMania](https://github.com/stepmania/stepmania) that downloads and automatically updates song ("simfile") packs hosted in Amazon S3 buckets.

Made with [Electron](https://www.electronjs.org/) and [Vue.js](https://vuejs.org/) via the [Quasar](https://quasar.dev/) framework.

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

## Uploading to Amazon S3

If you want to upload your own simfile packs to Amazon S3, you can follow these steps:

1. Create an AWS account if you haven't already.
   [Creating an IAM admin user](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html) is also recommended for interacting with AWS.
2. Create a new bucket (either from the Amazon S3 console or from the AWS CLI).
   The name of the bucket must contain only lowercase letters, numbers, and hyphens.
3. Configure the bucket to allow public access.
   From the Amazon S3 console, uncheck "Block *all* public access" and (optionally) re-check "Block public access to buckets and objects granted through [*new* & *any*] access control lists (ACLs)".
4. Add the following JSON to the bucket policy, replacing `<bucket-name>` with the bucket name:

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

Your bucket should now be public and ready for download from the app!

To add files to the bucket with AWS CLI:

```sh
aws s3 sync </path/to/packs> s3://<bucket-name> --delete
```

Be sure to run `aws configure` first with the Access Key ID and Secret Access Key of your IAM admin user account if you haven't already.
Also, the bucket must follow this directory structure in order for StepMania to recognize the simfiles in the app: `/<pack-name>/<song-name>/<song-files>`.

## Donate

Like the app?
Consider donating, which will help pay for the costs of hosting simfiles in cloud storage.

[![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=R3F883NUQFLP2)

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z42UJNY)

## License

See [LICENSE](./LICENSE) for details.
