# StepMania Song Manager

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A cross-platform companion app for [StepMania](https://github.com/stepmania/stepmania) that downloads and automatically updates song ("simfile") packs hosted in Git repositories.

Made with [Electron](https://www.electronjs.org/) and [Vue.js](https://vuejs.org/) via the [Quasar](https://quasar.dev/) framework.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z42UJNY)

## External Dependencies

This app requires [Git](https://git-scm.com/) and [Git LFS](https://git-lfs.github.com/) to be installed on your computer.
You can follow the instructions below to download and install both if they are not installed already.

### Windows

1.  Download and run the Git for Windows installer from [here](https://git-scm.com/download/win).
2.  Open Command Prompt or Git Bash, and run `git lfs install`.

### macOS/Linux

Install via [Homebrew](https://brew.sh/):

```bash
brew update
brew install git
brew install git-lfs
git lfs install
```

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

Simply click on the `+ Add Songs` button and select a repository from the list.
You can also add a new repository that is not already in the list, in which case a name for and the URL of the remote repository are required.

The selected repository will then be displayed on the home page where you can view information about the songs in the repository, clone the repository, or delete the repository.

> Note: removing a repository from the app does not delete any local files from your computer! This is to reduce the size of future downloads should you decide to re-add the repository. If you want to completely remove the downloaded packs from your computer, you can manually delete the folders yourself.

### Updating Song Packs

Once downloaded, all song packs will be updated periodically as long as the app is open or running in the background.
The app itself will check for and download updates automatically, or you can perform a manual update by clicking on the `Update` button in each repository.

### Settings

The settings page includes the following parameters.
Parameters are set to their default values when the app is launched for the first time.

| Name | Default Value | Description |
| :- | :- | :- |
| `Download Path` | (See below.) | The directory in which song packs will be downloaded. |
| `Preferences.ini Path` | Paths to all `Preferences.ini` files automatically found/detected. | The directory containing the `Preferences.ini` file for StepMania (or directories if multiple copies of StepMania are installed). |
| `Update Frequency` | `1 hour` | How often the app will check for updates and, if any, download them. |
| `Auto-Launch on Login` | `false` | Whether or not to open the app when the computer starts. |
| `Language` | `English` | Language of the app's user interface. |

Default download paths:

-   Windows: `%APPDATA%/StepMania Song Manager/Songs`
-   macOS: `~/Library/Application Support/StepMania Song Manager/Songs`
-   Linux:
  -   `$XDG_CONFIG_HOME/StepMania Song Manager/Songs`
  -   or `~/.config/StepMania Song Manager/Songs`

## License

See [LICENSE](./LICENSE) for details.
