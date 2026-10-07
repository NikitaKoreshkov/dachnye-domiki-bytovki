import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

export async function POST(request: Request) {
  let browser
  try {
    const body = await request.json()
    const { houseType, area, finishing, options, estimatedPrice } = body

    // Форматирование цены
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
    }

    // Получаем конфигурацию калькулятора и название компании из БД
    const [cfg, footerConfig] = await Promise.all([
      prisma.calculatorConfig.findFirst(),
      prisma.footerConfig.findFirst()
    ])
    const companyName = footerConfig?.companyName || 'Дачные-Домики-Бытовки'
    const houseTypesFromDb = cfg?.houseTypes as any[] || [
      { id: 'frame', name: 'Каркасный', basePrice: 5300 },
      { id: 'timber', name: 'Брусовой', basePrice: 7300 },
      { id: 'modular', name: 'Модульный', basePrice: 8400 }
    ]
    
    const finishingOptionsFromDb = cfg?.finishingOptions as any[] || [
      { name: 'Без отделки', multiplier: 0 },
      { name: 'Чистовая отделка', multiplier: 0.3 },
      { name: 'Евро отделка', multiplier: 0.5 }
    ]
    
    const houseTypeData = houseTypesFromDb.find(ht => ht.name === houseType) || houseTypesFromDb[0]
    const basePrice = houseTypeData.basePrice * area
    
    let finishingPrice = 0
    finishing.forEach((finishName: string) => {
      const finish = finishingOptionsFromDb.find(f => f.name === finishName)
      if (finish) {
        finishingPrice += basePrice * finish.multiplier
      }
    })

    const estimateHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      padding: 30px;
      color: #000;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #5D4E37;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 24pt;
      font-weight: bold;
      color: #5D4E37;
      margin-bottom: 10px;
    }
    .header .company {
      font-size: 14pt;
      color: #666;
      margin-bottom: 5px;
    }
    .header .date {
      font-size: 10pt;
      color: #999;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #5D4E37;
      margin-bottom: 15px;
      border-bottom: 2px solid #E5DFD0;
      padding-bottom: 5px;
    }
    .params {
      background: #F5F1E8;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .param-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E5DFD0;
    }
    .param-row:last-child {
      border-bottom: none;
    }
    .param-label {
      font-weight: 600;
      color: #333;
    }
    .param-value {
      color: #5D4E37;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th {
      background: #5D4E37;
      color: #fff;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .table td {
      padding: 10px 12px;
      border-bottom: 1px solid #E5DFD0;
    }
    .table tr:nth-child(even) {
      background: #F9F7F3;
    }
    .table .number {
      text-align: right;
      font-weight: 600;
    }
    .total {
      margin-top: 30px;
      padding: 20px;
      background: #F5F1E8;
      border-radius: 8px;
      border: 2px solid #5D4E37;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 16pt;
      font-weight: bold;
      color: #5D4E37;
      margin-top: 10px;
    }
    .total-label {
      font-size: 14pt;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5DFD0;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    .note {
      margin-top: 20px;
      padding: 15px;
      background: #FFF9E6;
      border-left: 4px solid #F0C674;
      border-radius: 4px;
      font-size: 10pt;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>СМЕТА НА СТРОИТЕЛЬСТВО</h1>
    <div class="company">${companyName}</div>
    <div class="date">Дата составления: ${new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
  </div>

  <div class="section">
    <div class="section-title">Параметры объекта</div>
    <div class="params">
      <div class="param-row">
        <span class="param-label">Тип дома:</span>
        <span class="param-value">${houseType}</span>
      </div>
      <div class="param-row">
        <span class="param-label">Площадь:</span>
        <span class="param-value">${area} м²</span>
      </div>
      <div class="param-row">
        <span class="param-label">Тип отделки:</span>
        <span class="param-value">${finishing.length > 0 ? finishing.join(', ') : 'Без отделки'}</span>
      </div>
      ${options.length > 0 ? `
      <div class="param-row">
        <span class="param-label">Дополнительные опции:</span>
        <span class="param-value">${options.map((o: any) => o.name).join(', ')}</span>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Состав работ и материалов</div>
    <table class="table">
      <thead>
        <tr>
          <th>№</th>
          <th>Наименование</th>
          <th>Ед. изм.</th>
          <th>Кол-во</th>
          <th>Цена за ед.</th>
          <th>Сумма</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Строительство коробки дома (${houseType})</td>
          <td>м²</td>
          <td>${area}</td>
          <td class="number">${formatPrice(houseTypeData.basePrice)}</td>
          <td class="number">${formatPrice(basePrice)}</td>
        </tr>
        ${finishingPrice > 0 ? `
        <tr>
          <td>2</td>
          <td>Отделочные работы${finishing.length > 0 ? ` (${finishing.join(', ')})` : ''}</td>
          <td>компл.</td>
          <td>1</td>
          <td class="number">—</td>
          <td class="number">${formatPrice(Math.round(finishingPrice))}</td>
        </tr>
        ` : ''}
        ${options.map((option: any, index: number) => `
        <tr>
          <td>${2 + (finishingPrice > 0 ? 1 : 0) + index + 1}</td>
          <td>${option.name}</td>
          <td>шт.</td>
          <td>1</td>
          <td class="number">${formatPrice(option.price)}</td>
          <td class="number">${formatPrice(option.price)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="total">
    <div class="total-row">
      <span class="total-label">Итого:</span>
      <span>${formatPrice(estimatedPrice)}</span>
    </div>
  </div>

  <div class="note">
    <strong>Примечание:</strong> Данная смета является предварительной. Окончательная стоимость работ и материалов уточняется после выезда специалиста на объект, утверждения проекта и подготовки детальной спецификации. Цены действительны на дату составления сметы.
  </div>

  <div class="footer">
    <div>© ${new Date().getFullYear()} ${companyName}. Все права защищены.</div>
    <div>Телефон: +7 (495) 023-82-15 | Email: info@dachnye-domiki-bytovki.ru</div>
    <div>108811, РОССИЯ, Г МОСКВА, МОСКОВСКИЙ П, УЛ КАРТМАЗОВСКИЕ ПРУДЫ, Д 2, КОРП 3. КВ 474</div>
  </div>
</body>
</html>
`

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    // Отключаем таймаут навигации и упрощаем условие ожидания загрузки контента
    page.setDefaultNavigationTimeout(0)
    await page.setContent(estimateHTML, { waitUntil: 'domcontentloaded', timeout: 0 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      printBackground: true
    })

    await browser.close()

    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await prisma.estimateDocument.create({
          data: {
            userId: session.user.id,
            title: `Смета: ${houseType}, ${area} м²`,
            params: body,
          }
        })
      }
    } catch (e) {
      console.error('Failed to save estimate document:', e)
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="smeta-dachnye-domiki-bytovki.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    console.error('Error generating estimate PDF:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации сметы', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

