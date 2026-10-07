import {
  ADVANTAGES_DEFAULT,
  CALCULATOR_DEFAULT,
  CATALOG_SEO_DEFAULT,
  CONTRACT_TEMPLATE_DEFAULT,
  FOOTER_DEFAULT,
  HEADER_DEFAULT,
  HERO_DEFAULT,
  METADATA_DEFAULT,
  PROCESS_STEPS_DEFAULT,
  REVIEWS_CONFIG_DEFAULT,
} from './configs'
import { CATALOG_FILTERS_DEFAULT, FAQ, PROJECT_OPTIONS_DEFAULT, REVIEWS } from './catalog'
import { LEGAL_DEFAULTS } from './legal'
import { sanitizeHtml } from '../api'
import { ConfigRejected, type ConfigSpec } from './route'

/** FAQ and reviews are lists rather than one row, so they keep their own fallbacks. */
export const FAQ_DEFAULTS = FAQ.map(item => ({ id: `faq-seed-${item.order}`, ...item }))

export const REVIEW_DEFAULTS = REVIEWS.map(review => ({ id: `review-seed-${review.name}`, ...review }))

/**
 * One spec per editable block: which table it lives in, which body keys an admin
 * may save, and how the row is presented to the browser. Both the public route
 * and the `/api/admin` route of a block read the same spec, so the two can no
 * longer disagree about the fallback text.
 */

const jsonBlock = (keys: string[]) => (data: Record<string, unknown>) => {
  for (const key of keys) {
    if (key in data && (data[key] === null || typeof data[key] !== 'object')) {
      throw new ConfigRejected(`${key} must be an object or an array`)
    }
  }
  return data
}

const html = (data: Record<string, unknown>, key: string) =>
  typeof data[key] === 'string' ? { ...data, [key]: sanitizeHtml(data[key]) } : data

export const heroSpec: ConfigSpec = {
  model: 'heroConfig',
  tag: 'HERO',
  defaults: HERO_DEFAULT,
  fields: ['heroImage', 'title', 'subtitle'],
}

export const headerSpec: ConfigSpec = {
  model: 'headerConfig',
  tag: 'HEADER',
  defaults: HEADER_DEFAULT,
  fields: ['logoText', 'logoImage', 'showLogoText'],
  nullable: ['logoImage'],
}

export const footerSpec: ConfigSpec = {
  model: 'footerConfig',
  tag: 'FOOTER',
  defaults: FOOTER_DEFAULT,
  fields: [
    'companyName', 'companyDescription', 'whatsappUrl', 'whatsappText', 'phone', 'email',
    'addressLine1', 'addressLine2', 'addressLine3', 'workingHoursLine1', 'workingHoursLine2',
    'newsletterTitle', 'newsletterDescription', 'copyright', 'ip', 'inn', 'legalAddress',
  ],
}

export const advantagesSpec: ConfigSpec = {
  model: 'advantagesConfig',
  tag: 'ADVANTAGES',
  defaults: ADVANTAGES_DEFAULT,
  fields: ['title', 'subtitle', 'items'],
  prepare: jsonBlock(['items']),
}

export const processStepsSpec: ConfigSpec = {
  model: 'processStepsConfig',
  tag: 'PROCESS_STEPS',
  defaults: PROCESS_STEPS_DEFAULT,
  fields: ['title', 'subtitle', 'steps'],
  prepare: jsonBlock(['steps']),
}

export const calculatorSpec: ConfigSpec = {
  model: 'calculatorConfig',
  tag: 'CALCULATOR',
  defaults: CALCULATOR_DEFAULT,
  fields: [
    'houseTypes', 'finishingOptions', 'additionalOptions', 'stepTexts', 'areaSettings',
    'formula', 'whatsappTemplate', 'estimateTemplate',
  ],
  prepare: jsonBlock(['houseTypes', 'finishingOptions', 'additionalOptions', 'stepTexts', 'areaSettings']),
}

export const catalogSeoSpec: ConfigSpec = {
  model: 'catalogSeoTextConfig',
  tag: 'CATALOG_SEO',
  defaults: CATALOG_SEO_DEFAULT,
  fields: ['title', 'content'],
  prepare: data => html(data, 'content'),
}

export const metadataSpec: ConfigSpec = {
  model: 'siteMetadataConfig',
  tag: 'METADATA',
  defaults: METADATA_DEFAULT,
  fields: ['faviconUrl', 'appleTouchIcon', 'siteTitle', 'siteDescription', 'siteKeywords', 'ogImage'],
  nullable: ['faviconUrl', 'appleTouchIcon'],
}

export const reviewsConfigSpec: ConfigSpec = {
  model: 'reviewsConfig',
  tag: 'REVIEWS_CONFIG',
  defaults: REVIEWS_CONFIG_DEFAULT,
  fields: ['title', 'description'],
}

export const projectOptionsSpec: ConfigSpec = {
  model: 'projectOptionsConfig',
  tag: 'PROJECT_OPTIONS',
  defaults: PROJECT_OPTIONS_DEFAULT,
  fields: ['finishing', 'insulation', 'floor', 'foundation'],
  prepare: jsonBlock(['finishing', 'insulation', 'floor', 'foundation']),
}

export const catalogFiltersSpec: ConfigSpec = {
  model: 'catalogFiltersConfig',
  tag: 'CATALOG_FILTERS',
  defaults: { config: CATALOG_FILTERS_DEFAULT },
  fields: ['config'],
  prepare: jsonBlock(['config']),
}

/** The public filter route strips bookkeeping keys the editor stores alongside. */
export const catalogFiltersPublicSpec: ConfigSpec = {
  ...catalogFiltersSpec,
  shape: row => {
    const { blocks, layout, ...config } = (row.config ?? {}) as Record<string, unknown>
    return { id: row.id, config }
  },
}

const legalSpec = (model: string, tag: string, key: keyof typeof LEGAL_DEFAULTS): ConfigSpec => ({
  model,
  tag,
  defaults: LEGAL_DEFAULTS[key],
  fields: ['title', 'content'],
  prepare: data => html(data, 'content'),
})

export const privacySpec = legalSpec('privacyConfig', 'PRIVACY', 'privacy')
export const termsSpec = legalSpec('termsConfig', 'TERMS', 'terms')
export const cookiesSpec = legalSpec('cookiesConfig', 'COOKIES', 'cookies')

export const contractTemplateSpec: ConfigSpec = {
  model: 'contractTemplateConfig',
  tag: 'CONTRACT_TEMPLATE',
  defaults: CONTRACT_TEMPLATE_DEFAULT,
  fields: ['filePath'],
  nullable: ['filePath'],
}

export const LEGAL_SPECS: Record<string, ConfigSpec> = {
  privacy: privacySpec,
  terms: termsSpec,
  cookies: cookiesSpec,
}
