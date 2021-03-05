# StepMania Song Manager

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A cross-platform companion app for [StepMania](https://github.com/stepmania/stepmania) that downloads and automatically updates song ("simfile") packs hosted in Git repositories.

Made with [Electron](https://www.electronjs.org/) and [Vue.js](https://vuejs.org/) via the [Quasar](https://quasar.dev/) framework.

## Development

Install dependencies:

```bash
yarn
```

Start app in development mode (hot-code reloading, error reporting, etc.):

```bash
yarn run dev
```

Lint files:

```bash
yarn run lint
```

Build app for production:

```bash
yarn run build
```

To customize the Quasar configuration, see [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Using the App

(for version 0.1, currently under development)

### Adding Song Packs

Simply click on the `+ Add Songs` button and select a repository from the list.
You can also add a custom repository, in which case a name for the repository and the Git URL is required (the `.git` suffix is optional).

The selected repository will then be displayed on the home page where you can view information about the songs in the repository, clone the repository, or delete the repository.

### Updating Song Packs

Once downloaded, all song packs will be updated automatically as long as the app is open or running in the background.
The app itself will check for and download updates periodically, or you can perform an update immediately by clicking on the `Update` button.

### Settings

The settings page includes the following parameters.
Parameters are set to their default values when the app is launched for the first time.

| Name | Default Value | Description |
| :- | :- | :- |
| `Download Path` | `$APP_PATH/Songs/` | The directory in which song packs will be downloaded. |
| `'Preferences.ini' Path` | Paths to all `Preferences.ini` files (automatically found/detected). | The directory containing the `Preferences.ini` file for StepMania (or directories if multiple copies of StepMania are installed). |
| `Auto-Launch on Login` | `true` | Whether or not to open the app when the computer starts. |
| `Update Frequency` | 1 hour | How often the app will check for updates and, if any, download them. |
| `Language` | English | Language of the app's user interface. |

## License

See [LICENSE](./LICENSE) for details.
