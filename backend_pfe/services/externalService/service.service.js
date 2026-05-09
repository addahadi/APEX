import sql from '../../config/database.js';
import { ValidationError } from '../../utils/AppError.js';

const getAllServices = async ({ search, page, limit } = {}) => {
    const pg   = Math.max(1, Number(page) || 1);
    const lim  = Math.max(1, Math.min(100, Number(limit) || 50));
    const off  = (pg - 1) * lim;

    const where = search
      ? sql`WHERE sc.service_name_en ILIKE ${'%' + search + '%'}
             OR sc.service_name_ar ILIKE ${'%' + search + '%'}`
      : sql``;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM service_config sc
      ${where}
    `;

    const rows = await sql`
      SELECT
        sc.service_id,
        sc.category_id,
        sc.formula_id,
        sc.unit_id,
        sc.service_name_en,
        sc.service_name_ar,
        sc.equipment_cost,
        sc.manpower_cost,
        sc.install_labor_price,
        sc.unit_en,
        sc.unit_ar,
        c.name_en  AS category_name,
        u.symbol   AS unit_symbol,
        u.name_en  AS unit_name,
        f.name_en  AS formula_name,
        f.category_id AS formula_category_id
      FROM service_config sc
      LEFT JOIN categories c ON c.category_id = sc.category_id
      LEFT JOIN units u      ON u.unit_id     = sc.unit_id
      LEFT JOIN formulas f   ON f.formula_id  = sc.formula_id
      ${where}
      ORDER BY sc.service_name_en
      LIMIT ${lim} OFFSET ${off}
    `;

    return {
      data: rows,
      pagination: {
        total: count,
        page: pg,
        limit: lim,
        total_pages: Math.ceil(count / lim),
      },
    };
};

/**
 * Fetch all SERVICE-type + MATERIAL-type formulas (for the admin formula selector).
 * Returns formulas that can be linked to service_config for quantity computation.
 */
const getServiceFormulas = async () => {
    return sql`
      SELECT
        f.formula_id,
        f.category_id,
        COALESCE(f.name_en, f.name_ar, 'Unnamed Formula') AS name,
        f.name_en,
        f.name_ar,
        f.formula_type,
        c.name_en AS category_name
      FROM formulas f
      LEFT JOIN categories c ON c.category_id = f.category_id
      WHERE f.formula_type = 'SERVICE'
      ORDER BY c.name_en, f.name_en
    `;
};

export { getAllServices, getServiceFormulas };
