import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, sql } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import {
  TaxCalculationResponseDto,
  TaxBracketBreakdown,
} from './dto/tax-calculation-response.dto';

const { taxCategories, taxRates } = schema;

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  label: string;
}

const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 60_000_000, rate: 0.05, label: '0 - 60,000,000' },
  {
    min: 60_000_000,
    max: 250_000_000,
    rate: 0.15,
    label: '60,000,001 - 250,000,000',
  },
  {
    min: 250_000_000,
    max: 500_000_000,
    rate: 0.25,
    label: '250,000,001 - 500,000,000',
  },
  {
    min: 500_000_000,
    max: 5_000_000_000,
    rate: 0.3,
    label: '500,000,001 - 5,000,000,000',
  },
  { min: 5_000_000_000, max: Infinity, rate: 0.35, label: '> 5,000,000,000' },
];

const PTKP = 54_000_000;

@Injectable()
export class TaxService implements OnModuleInit {
  private readonly logger = new Logger(TaxService.name);

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  /**
   * Seed initial tax categories and rates if the tables are empty.
   */
  async seed(): Promise<void> {
    const existingCategories = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(taxCategories);

    if (Number(existingCategories[0]?.total) > 0) {
      this.logger.log('Tax categories already seeded, skipping.');
      return;
    }

    const now = new Date().toISOString();

    const categories = [
      {
        id: uuidv4(),
        name: 'PPh 21',
        name_en: 'Income Tax Article 21',
        description:
          'Pajak Penghasilan Pasal 21 untuk karyawan dan pekerja lepas',
        description_en: 'Income Tax Article 21 for employees and freelancers',
        slug: 'pph-21',
        icon: 'briefcase',
        is_active: true,
        sort_order: 1,
        created_at: now,
      },
      {
        id: uuidv4(),
        name: 'PPh 23',
        name_en: 'Income Tax Article 23',
        description: 'Pajak Penghasilan Pasal 23 atas jasa, sewa, dan royalti',
        description_en:
          'Income Tax Article 23 for services, rent, and royalties',
        slug: 'pph-23',
        icon: 'file-text',
        is_active: true,
        sort_order: 2,
        created_at: now,
      },
      {
        id: uuidv4(),
        name: 'PPH Final',
        name_en: 'Final Income Tax',
        description:
          'Pajak Penghasilan Final untuk UMKM dan transaksi tertentu',
        description_en: 'Final Income Tax for MSMEs and specific transactions',
        slug: 'pph-final',
        icon: 'check-circle',
        is_active: true,
        sort_order: 3,
        created_at: now,
      },
      {
        id: uuidv4(),
        name: 'PPN',
        name_en: 'Value Added Tax (VAT)',
        description: 'Pajak Pertambahan Nilai untuk barang dan jasa kena pajak',
        description_en: 'Value Added Tax for taxable goods and services',
        slug: 'ppn',
        icon: 'shopping-cart',
        is_active: true,
        sort_order: 4,
        created_at: now,
      },
      {
        id: uuidv4(),
        name: 'SPT Tahunan',
        name_en: 'Annual Tax Return',
        description: 'Surat Pemberitahuan Tahunan Pajak Penghasilan',
        description_en: 'Annual Income Tax Return filing',
        slug: 'spt-tahunan',
        icon: 'calendar',
        is_active: true,
        sort_order: 5,
        created_at: now,
      },
    ];

    await db.insert(taxCategories).values(categories);
    this.logger.log('Tax categories seeded successfully.');

    const pph21Category = categories.find((c) => c.slug === 'pph-21');
    const pph23Category = categories.find((c) => c.slug === 'pph-23');
    const ppnCategory = categories.find((c) => c.slug === 'ppn');

    const rates = [
      {
        id: uuidv4(),
        category_id: pph21Category!.id,
        name: 'Tarif 5%',
        name_en: 'Rate 5%',
        rate: 5,
        description: 'Lapisan penghasilan kena pajak 0 - 60 juta',
        is_active: true,
        created_at: now,
      },
      {
        id: uuidv4(),
        category_id: pph21Category!.id,
        name: 'Tarif 15%',
        name_en: 'Rate 15%',
        rate: 15,
        description: 'Lapisan penghasilan kena pajak 60 juta - 250 juta',
        is_active: true,
        created_at: now,
      },
      {
        id: uuidv4(),
        category_id: pph21Category!.id,
        name: 'Tarif 25%',
        name_en: 'Rate 25%',
        rate: 25,
        description: 'Lapisan penghasilan kena pajak 250 juta - 500 juta',
        is_active: true,
        created_at: now,
      },
      {
        id: uuidv4(),
        category_id: pph21Category!.id,
        name: 'Tarif 30%',
        name_en: 'Rate 30%',
        rate: 30,
        description: 'Lapisan penghasilan kena pajak 500 juta - 5 miliar',
        is_active: true,
        created_at: now,
      },
      {
        id: uuidv4(),
        category_id: pph23Category!.id,
        name: 'Tarif 15%',
        name_en: 'Rate 15%',
        rate: 15,
        description: 'Tarif umum PPh 23 untuk jasa',
        is_active: true,
        created_at: now,
      },
      {
        id: uuidv4(),
        category_id: pph23Category!.id,
        name: 'Tarif 0.5%',
        name_en: 'Rate 0.5%',
        rate: 0.5,
        description: 'PPh Final UMKM (PP 23/2018)',
        is_active: true,
        created_at: now,
      },
      {
        id: uuidv4(),
        category_id: ppnCategory!.id,
        name: 'PPN Umum 11%',
        name_en: 'General VAT 11%',
        rate: 11,
        description: 'Tarif PPN umum sesuai UU HPP',
        is_active: true,
        created_at: now,
      },
    ];

    await db.insert(taxRates).values(rates);
    this.logger.log('Tax rates seeded successfully.');
  }

  /**
   * Calculate PPh 21 tax estimate using progressive brackets.
   */
  calculate(dto: CalculateTaxDto): TaxCalculationResponseDto {
    const { income, type, deductions = 0 } = dto;
    const annualIncome = income * 12;

    let taxableIncome: number;

    if (type === 'freelancer') {
      const normIncome = annualIncome * 0.5;
      taxableIncome = Math.max(0, normIncome - PTKP - deductions);
    } else {
      taxableIncome = Math.max(0, annualIncome - PTKP - deductions);
    }

    const brackets: TaxBracketBreakdown[] = [];
    let totalTax = 0;
    let remaining = taxableIncome;

    for (const bracket of TAX_BRACKETS) {
      if (remaining <= 0) break;

      const bracketMax = bracket.max === Infinity ? remaining : bracket.max;
      const bracketTaxable = Math.min(remaining, bracketMax - bracket.min);
      const bracketTax = Math.round(bracketTaxable * bracket.rate);

      brackets.push({
        bracket: bracket.label,
        rate: bracket.rate * 100,
        taxable: bracketTaxable,
        tax: bracketTax,
      });

      totalTax += bracketTax;
      remaining -= bracketTaxable;
    }

    const monthlyTax = Math.round(totalTax / 12);
    const effectiveRate =
      annualIncome > 0
        ? Math.round((totalTax / annualIncome) * 10000) / 100
        : 0;

    return {
      annual_income: annualIncome,
      ptkp: PTKP,
      deductions,
      taxable_income: taxableIncome,
      annual_tax: totalTax,
      monthly_tax: monthlyTax,
      effective_rate: effectiveRate,
      brackets,
      type,
    };
  }

  /**
   * List all tax categories (public).
   */
  async getCategories() {
    const items = await db
      .select({
        id: taxCategories.id,
        name: taxCategories.name,
        name_en: taxCategories.name_en,
        description: taxCategories.description,
        description_en: taxCategories.description_en,
        slug: taxCategories.slug,
        icon: taxCategories.icon,
        sort_order: taxCategories.sort_order,
      })
      .from(taxCategories)
      .where(eq(taxCategories.is_active, true))
      .orderBy(sql`${taxCategories.sort_order} ASC`);

    return items;
  }

  /**
   * List all tax rates, optionally filtered by category_id (public).
   */
  async getRates(categoryId?: string) {
    const conditions = [eq(taxRates.is_active, true)];
    if (categoryId) {
      conditions.push(eq(taxRates.category_id, categoryId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select({
        id: taxRates.id,
        category_id: taxRates.category_id,
        name: taxRates.name,
        name_en: taxRates.name_en,
        rate: taxRates.rate,
        description: taxRates.description,
      })
      .from(taxRates)
      .where(whereClause)
      .orderBy(sql`${taxRates.rate} ASC`);

    return items;
  }
}
