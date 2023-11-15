import color from '@heroku-cli/color'
import {Command, flags} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import {Args, ux} from '@oclif/core'
import {sortBy} from 'lodash'

interface Features {
  currentUser: any,
  user: any,
  app?: any,
}

function printJSON(features: Heroku.Account | Heroku.AccountFeature | Heroku.AppFeature) {
  ux.log(JSON.stringify(features, null, 2))
}

function printFeatures(features: any) {
  features = sortBy(features, 'name')
  const longest = Math.max.apply(null, features.map((f: Record<string, string>) => f.name.length))
  for (const f of features) {
    let line = `${f.enabled ? '[+]' : '[ ]'} ${f.name!.padEnd(longest)}`
    if (f.enabled) line = color.green(line)
    line = `${line}  ${f.description}`
    ux.log(line)
  }
}

export default class LabsIndex extends Command {
  static description = 'list experimental features'
  static topic = 'labs'

  static args = {
    app: Args.string({required: false}),
  }

  static flags = {
    app: flags.app({required: false}),
    json: flags.boolean({description: 'display as json', required: false}),
  }

  async run() {
    const {args, flags} = await this.parse(LabsIndex)
    const [currentUserResponse, userResponse, appResponse] = await Promise.all([
      this.heroku.get<Heroku.Account>('/account'),
      this.heroku.get<Heroku.AccountFeature>('/account/features'),
      (args.app || flags.app) ? this.heroku.get<Heroku.AppFeature>(`/apps/${args.app ? args.app : flags.app}/features`) : null,
    ])

    let app = null
    const currentUser = currentUserResponse.body
    const user = userResponse.body

    const features: Features = {
      currentUser,
      user,
    }

    // makes sure app isn't added to json object if null
    if (appResponse !== null) {
      app = appResponse!.body
      features.app = app
    }

    // general features are managed via `features` not `labs`
    features.user = features.user.filter((f: Record<string, string>) => f.state !== 'general')
    if (features.app) features.app = features.app.filter((f: Record<string, string>) => f.state !== 'general')
    if (flags.json) {
      // Added the comments below as the current logic breaks
      // interface rules and other solutions are quite verbose
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete features.currentUser
      printJSON(features)
    } else {
      ux.styledHeader(`User Features ${color.cyan(features.currentUser.email!)}`)
      printFeatures(features.user)
      if (features.app) {
        ux.log()
        ux.styledHeader(`App Features ${color.app(args.app ? args.app! : flags.app!)}`)
        printFeatures(features.app)
      }
    }
  }
}