import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'

export default function (app) {
  const userAbilityRules = useCookie('userAbilityRules')
  const rules = userAbilityRules.value ?? []
  const fallBack = [
    { action: 'manage', subject: 'all' },
  ]
  const initialAbility = createMongoAbility(rules.length ? rules : fallBack)

  app.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
}
