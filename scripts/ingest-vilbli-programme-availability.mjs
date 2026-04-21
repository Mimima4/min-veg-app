import { chromium } from 'playwright'

const DEFAULT_URL =
  'https://www.vilbli.no/nb/no/strukturkart/v.el/elenergi-og-ekom?kurs=v.elele2----&side=p2'

const TARGET_FYLKE_LABEL = 'Oslo'
const TARGET_PROGRAMME_LABEL = 'Elenergi og ekom'

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function safePreview(value, limit = 500) {
  if (!value) return ''
  return value.slice(0, limit)
}

async function clickIfVisible(page, texts) {
  for (const text of texts) {
    const locator = page.getByText(text, { exact: false }).first()
    const count = await locator.count().catch(() => 0)
    if (!count) continue

    const visible = await locator.isVisible().catch(() => false)
    if (!visible) continue

    await locator.click().catch(() => {})
    await page.waitForTimeout(2000)
    return true
  }

  return false
}

async function selectFylke(page, fylkeLabel) {
  const fylkeUiFound = await clickIfVisible(page, ['Velg fylke', 'Vel fylke', 'Fylke'])
  console.log(`Fylke UI found: ${fylkeUiFound ? 'yes' : 'no'}`)
  if (!fylkeUiFound) {
    return { ok: false, mode: 'ui_not_found' }
  }

  let mode = 'roleOption'
  let osloSelected = false

  const roleOption = page.getByRole('option', { name: fylkeLabel, exact: true }).first()
  const roleOptionCount = await roleOption.count().catch(() => 0)

  if (roleOptionCount > 0 && (await roleOption.isVisible().catch(() => false))) {
    await roleOption.click().catch(() => {})
    osloSelected = true
  } else {
    const textOption = page.getByText(fylkeLabel, { exact: true }).first()
    const textOptionCount = await textOption.count().catch(() => 0)

    if (textOptionCount > 0 && (await textOption.isVisible().catch(() => false))) {
      await textOption.click().catch(() => {})
      mode = 'textOption'
      osloSelected = true
    } else {
      const evalClicked = await page.evaluate((name) => {
        const isVisible = (el) => {
          const style = window.getComputedStyle(el)
          const rect = el.getBoundingClientRect()
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            rect.width > 0 &&
            rect.height > 0
          )
        }

        const elements = Array.from(
          document.querySelectorAll('[role="option"], li, button, a, div, span')
        )
        const target = elements.find((el) => {
          const text = el.textContent?.trim()
          return text === name && isVisible(el)
        })

        if (!target) return false
        target.click()
        return true
      }, fylkeLabel)

      mode = 'domFallback'
      osloSelected = evalClicked
    }
  }

  console.log(`Oslo selected: ${osloSelected ? 'yes' : 'no'}`)
  await page.waitForTimeout(2500)

  return { ok: osloSelected, mode: osloSelected ? mode : 'not_found' }
}

async function findSchoolsPageUrl(page) {
  return page.evaluate(() => {
    const normalize = (value) => value.replace(/\s+/g, ' ').trim()
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      text: normalize(a.textContent || '').toLowerCase(),
      href: a.getAttribute('href') || '',
    }))

    const byText = links.find(
      (link) =>
        link.text.includes('skoler og lærebedrifter') ||
        link.text.includes('skolar og lærebedrifter') ||
        link.text.includes('schools and training companies')
    )
    if (byText?.href) return byText.href

    const byHref = links.find((link) =>
      /skoler-og-laerebedrifter|skolar-og-laerebedrifter/i.test(link.href)
    )
    return byHref?.href || null
  })
}

async function extractVbMapStageArrays(page) {
  return page.evaluate(() => {
    const cloneSimple = (value) => {
      try {
        return JSON.parse(JSON.stringify(value))
      } catch {
        return null
      }
    }
    const parseArrayLiteral = (arrayLiteral) => {
      try {
        const fn = new Function(`return (${arrayLiteral});`)
        const parsed = fn()
        return Array.isArray(parsed) ? parsed : null
      } catch {
        return null
      }
    }
    const normalizeStageFromKey = (key) => {
      const suffix = key.replace(/^vb_map_data_/i, '')
      const match = suffix.match(/vg\d/i)
      return match ? match[0].toUpperCase() : suffix
    }

    const stageMap = {}
    const stageRawLiterals = {}

    // 1) Preferred: read already-initialized globals
    const globalKeys = Object.keys(window).filter((key) =>
      /^vb_map_data_/i.test(key)
    )
    for (const key of globalKeys) {
      const raw = cloneSimple(window[key])
      if (!Array.isArray(raw)) continue
      stageMap[normalizeStageFromKey(key)] = raw
    }

    // 2) Fallback: parse inline assignments from script text
    if (Object.keys(stageMap).length === 0) {
      const scripts = Array.from(document.querySelectorAll('script'))
        .map((script) => script.textContent || '')
        .filter(Boolean)

      for (const text of scripts) {
        const regex = /(?:window\.)?(vb_map_data_[A-Za-z0-9_]+)\s*=\s*(\[[\s\S]*?\]);/g
        let match = regex.exec(text)
        while (match) {
          const key = match[1]
          const arrayLiteral = match[2]
          const stageKey = normalizeStageFromKey(key)
          if (!stageRawLiterals[stageKey]) {
            stageRawLiterals[stageKey] = arrayLiteral
          }
          const parsed = parseArrayLiteral(arrayLiteral)
          if (Array.isArray(parsed) && !stageMap[stageKey]) {
            stageMap[stageKey] = parsed
          }
          match = regex.exec(text)
        }
      }
    }

    return { stageMap, stageRawLiterals }
  })
}

async function run() {
  const url = process.argv[2] || DEFAULT_URL
  const headless = process.env.VILBLI_HEADLESS !== 'false'

  const browser = await chromium.launch({ headless })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'nb-NO',
    viewport: { width: 1440, height: 1400 },
  })

  const page = await context.newPage()

  try {
    console.log(`Opening Vilbli page: ${url}`)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(4000)

    const initialText = normalizeText(await page.locator('body').innerText())

    if (
      initialText.includes('JavaScript is disabled') ||
      initialText.toLowerCase().includes('verify you are human') ||
      initialText.toLowerCase().includes('robot')
    ) {
      throw new Error(
        'Vilbli anti-bot / verification wall is still active for this browser session.'
      )
    }

    const expandedOffers = await clickIfVisible(page, [
      'Vis alle tilbudene',
      'Vis alle tilboda',
      'Show all offers',
    ])
    console.log(`Expanded offers clicked: ${expandedOffers ? 'yes' : 'no'}`)

    const openedSchoolsTab = await clickIfVisible(page, [
      'Skoler og lærebedrifter',
      'Skolar og lærebedrifter',
      'Schools and training companies',
    ])
    console.log(`Schools tab opened: ${openedSchoolsTab ? 'yes' : 'no'}`)

    const fylkeSelection = await selectFylke(page, TARGET_FYLKE_LABEL)

    const schoolsTabHref = await findSchoolsPageUrl(page)
    const schoolsPageUrl = schoolsTabHref
      ? new URL(schoolsTabHref, page.url()).toString()
      : null
    console.log(`Detected schools page URL: ${schoolsPageUrl || '(not found)'}`)

    if (schoolsPageUrl) {
      await page.goto(schoolsPageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForLoadState('networkidle').catch(() => {})
      await page.waitForTimeout(2500)
    }
    console.log(`Current page URL after navigation: ${page.url()}`)

    await page.waitForTimeout(3000)

    const extraction = await extractVbMapStageArrays(page)
    const rawStageMap = extraction.stageMap || {}
    const stageKeys = Object.keys(rawStageMap)
    const hasVg1 = Boolean(rawStageMap.VG1 || rawStageMap.Vg1)
    const hasVg2 = Boolean(rawStageMap.VG2 || rawStageMap.Vg2)
    console.log(`vb_map_data_Vg1 found: ${hasVg1 ? 'yes' : 'no'}`)
    console.log(`vb_map_data_Vg2 found: ${hasVg2 ? 'yes' : 'no'}`)

    const mapSchoolRecord = (item) => {
      if (Array.isArray(item)) {
        return {
          schoolName: String(item[3] || ''),
          schoolCode: String(item[4] || ''),
          schoolType: String(item[2] || ''),
          address: String(item[5] || ''),
          phone: String(item[6] || ''),
          email: String(item[7] || ''),
          fylkeName: String(item[8] || ''),
          schoolPagePath: String(item[9] || ''),
          latitude:
            typeof item[0] === 'number'
              ? item[0]
              : Number.isFinite(Number(item[0]))
                ? Number(item[0])
                : null,
          longitude:
            typeof item[1] === 'number'
              ? item[1]
              : Number.isFinite(Number(item[1]))
                ? Number(item[1])
                : null,
        }
      }

      return {
        schoolName: String(
          item.schoolName || item.school_name || item.name || item.title || item.school || ''
        ),
        schoolCode: String(
          item.schoolCode ||
            item.orgOrSchoolCode ||
            item.orgnr ||
            item.orgnr_skole ||
            item.school_code ||
            item.id ||
            ''
        ),
        schoolType: String(item.schoolType || item.type || ''),
        address: String(item.address || item.adresse || item.street || ''),
        phone: String(item.phone || item.telefon || item.tlf || ''),
        email: String(item.email || item.e_post || item.epost || ''),
        fylkeName: String(
          item.fylkeName || item.countyOrFylkeName || item.fylke || item.fylke_navn || item.county || ''
        ),
        schoolPagePath: String(
          item.schoolPagePath || item.url || item.href || item.link || item.path || ''
        ),
        latitude:
          typeof item.latitude === 'number'
            ? item.latitude
            : Number.isFinite(Number(item.latitude))
              ? Number(item.latitude)
              : null,
        longitude:
          typeof item.longitude === 'number'
            ? item.longitude
            : Number.isFinite(Number(item.longitude))
              ? Number(item.longitude)
              : null,
      }
    }

    const stageOrderScore = (stage) => {
      const n = Number((stage.match(/\d+/) || [999])[0])
      return Number.isFinite(n) ? n : 999
    }

    const stages = stageKeys
      .map((stageKey) => {
        const raw = Array.isArray(rawStageMap[stageKey]) ? rawStageMap[stageKey] : []
        const schools = raw
          .filter((item) => item && (typeof item === 'object' || Array.isArray(item)))
          .map(mapSchoolRecord)
          .filter(
            (item) =>
              item.schoolName && (item.schoolCode || item.schoolPagePath || item.address)
          )
        const stageName = stageKey.toUpperCase()
        console.log(`Parsed schools for ${stageName}: ${schools.length}`)
        return {
          stage: stageName,
          schools,
        }
      })
      .sort((a, b) => stageOrderScore(a.stage) - stageOrderScore(b.stage))

    const result = {
      sourceUrl: url,
      programme: TARGET_PROGRAMME_LABEL,
      fylke: TARGET_FYLKE_LABEL,
      stages,
    }

    console.log('\n=== FULL FLOW PREVIEW ===\n')
    console.log(JSON.stringify(result, null, 2))

  } finally {
    await context.close()
    await browser.close()
  }
}

run().catch((error) => {
  console.error('\nERROR:', error.message)
  process.exit(1)
})