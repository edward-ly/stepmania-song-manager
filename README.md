# StepMania Song Manager

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A cross-platform companion app for [StepMania](https://github.com/stepmania/stepmania) that downloads and automatically updates song ("simfile") packs hosted in Amazon S3 buckets.

Made with [Electron](https://www.electronjs.org/) and [Vue.js](https://vuejs.org/) via the [Quasar](https://quasar.dev/) framework.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z42UJNY)

## Development

```bash
# Install dependencies
yarn

# Start app in development mode (hot-code reloading, error reporting, etc.)
yarn dev

# Lint files
yarn lint

# Build app for production
yarn build -T win
yarn build -T mac
yarn build -T linux
yarn build -T all
```

To customize the Quasar configuration, see [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Using the App

### Adding Song Packs

Simply click on the `+ Add Songs` button and select a bucket from the list.
You can also add a new S3 bucket that is not already in the list, in which case the name of the S3 bucket is required.
*Please note that the S3 bucket must be publicly accessible in order for the app to be able to download the files within!*

The chosen bucket will then be displayed on the home page where you can view information about the songs in the bucket, download all files in the bucket, or remove the bucket from the app.

> Note: removing a bucket from the app does not delete any local files from your computer!
  This is to reduce the size of future downloads should you decide to re-add the bucket.
  If you want to completely remove the downloaded packs from your computer, you can manually delete the files and folders yourself.

### Updating Song Packs

Once downloaded, all song packs will automatically be detected and playable in StepMania the next time you run the game.
The packs will also be updated automatically as long as the app is open or running in the background.
The app itself will check for and download updates periodically, or you can perform a manual update by clicking on the `Update` button for each bucket.

### Settings

The settings page includes the following parameters.
Parameters are set to their default values when the app is launched for the first time.

| Name | Default Value | Description |
| :- | :- | :- |
| `Download Path` | (See below.) | The directory in which song packs will be downloaded. Only applies to newly added packs. |
| `Preferences.ini Path` | Paths to all `Preferences.ini` files automatically found/detected. | The full path to the `Preferences.ini` file for StepMania (or paths if multiple copies of StepMania are installed). |
| `Update Frequency` | `1 hour` | How often the app will check for and download updates. |
| `Auto-Launch on Login` | `false` | Whether or not to open the app when the computer starts. |
| `Language` | `English` | Language of the app's user interface. |

Default download paths:

-   Windows: `%APPDATA%/StepMania Song Manager/Songs`
-   macOS: `~/Library/Application Support/StepMania Song Manager/Songs`
-   Linux:
  -   `$XDG_CONFIG_HOME/StepMania Song Manager/Songs`, or
  -   `~/.config/StepMania Song Manager/Songs`

## License

See [LICENSE](./LICENSE) for details.
