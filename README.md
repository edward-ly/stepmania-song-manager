# StepMania Song Manager

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A cross-platform companion app for [StepMania](https://github.com/stepmania/stepmania) that downloads and automatically updates song packs that are hosted in Git repositories.

Made with [Electron](https://www.electronjs.org/) and [Vue.js](https://vuejs.org/) via the [Quasar](https://quasar.dev/) framework.

## Development

Install dependencies:

```bash
yarn
```

Start app in development mode (hot-code reloading, error reporting, etc.):

```bash
quasar dev -m electron
```

Lint files:

```bash
yarn run lint
```

Build app for production:

```bash
quasar build -m electron
```

To customize the Quasar configuration, see [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Using the App

(for version 0.1, currently under development)

### Adding Song Packs

Simply click on the `+ Add Songs` button and select a repository from the list. You can also add a custom repository, in which case a name for the repository and the Git URL is required (the `.git` suffix is optional).

The selected repository will then be displayed on the home page where you can view information about the songs in the repository, clone the repository, or delete the repository.

### Updating Song Packs

Once downloaded, all song packs will be updated automatically as long as the app is open or running in the background. The app itself will check for and download updates periodically, or you can perform the update immediately by clicking on the `Update` button.

### Settings

The settings page includes the following parameters. Parameters will be set to their default values when the app is launched for the first time.

| Name | Default Value | Description |
| :- | :- | :- |
| `Download Path` | `$APP_PATH/Songs/` | The directory where downloaded song packs (repositories) will be located (cloned). |
| `'Preferences.ini' Path` | Path(s) to all `Preferences.ini` files automatically detected. | The directory containing the `Preferences.ini` file for StepMania 5 (or directories if multiple copies of StepMania are installed). |
| `Auto-Launch on Login` | `true` | Whether or not to open the app when the computer starts. |
| `Update Frequency` | 1 hour | How often the app will check for updates. |
| `Language` | English | Language of the app user interface. |

## License

See [LICENSE](./LICENSE) for details.
