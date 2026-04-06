/**
 * Convert carCRM Excel → vietnam-locations.ts
 * 
 * Đọc file ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx
 * Parse 63 tỉnh/thành → quận/huyện → phường/xã
 * Export ra app/lib/data/vietnam-locations.ts
 * 
 * Chạy: node scripts/convert-locations.js
 */

const fs = require('fs');
const path = require('path');
// xlsx is installed in app/node_modules
const XLSX = require(path.join(__dirname, '..', 'app', 'node_modules', 'xlsx'));

// ═══════════════════════════════════════════════════
// 1. ĐỌC FILE EXCEL
// ═══════════════════════════════════════════════════

const inputPath = path.join(__dirname, '..', 'ref', 'carCRM_Danh-muc-Phuong-xa_2025.xlsx');
const outputPath = path.join(__dirname, '..', 'app', 'lib', 'data', 'vietnam-locations.ts');

console.log('📖 Đọc file Excel:', inputPath);

const wb = XLSX.readFile(inputPath);
const ws = wb.Sheets[wb.SheetNames[0]];

// Skip row 1 (company info) and row 2 (header)
// Data starts from row 3 (index 2 in 0-based)
const rawData = XLSX.utils.sheet_to_json(ws, {
  range: 1, // Skip first row (company info)
  header: [
    'used',           // A: Sử dụng
    'stt',            // B: STT
    'province_code',  // C: Mã tỉnh (BNV)
    'province_name',  // D: Tên tỉnh/TP
    'province_tms',   // E: Mã tỉnh (TMS)
    'district_code',  // F: Mã Quận huyện TMS
    'district_name',  // G: Tên Quận huyện
    'page',           // H: Số tờ tăng
    'ward_code',      // I: Mã phường/xã mới
    'ward_name',      // J: Tên Phường/Xã mới
    'blank',          // K: Cột trống
  ],
});

console.log(`📊 Tổng số dòng raw: ${rawData.length}`);

// ═══════════════════════════════════════════════════
// 2. FILTER & CLEAN DATA
// ═══════════════════════════════════════════════════

// Filter: Chỉ lấy dòng có đủ tỉnh + quận + phường
const validData = rawData.filter(row => {
  return row.province_name 
    && row.district_name 
    && row.ward_name
    && typeof row.province_name === 'string'
    && typeof row.district_name === 'string'
    && typeof row.ward_name === 'string'
    && row.province_name.trim().length > 0
    && row.district_name.trim().length > 0
    && row.ward_name.trim().length > 0;
});

console.log(`✅ Dòng hợp lệ: ${validData.length}`);

// ═══════════════════════════════════════════════════
// 3. GROUP NESTED: Province → District → Ward
// ═══════════════════════════════════════════════════

const provinceMap = new Map();

for (const row of validData) {
  const provinceName = String(row.province_name).trim();
  const provinceCode = String(row.province_code || '').trim();
  const districtName = String(row.district_name).trim();
  const districtCode = String(row.district_code || '').trim();
  const wardName = String(row.ward_name).trim();
  const wardCode = String(row.ward_code || '').trim();

  // Get or create province
  if (!provinceMap.has(provinceName)) {
    provinceMap.set(provinceName, {
      name: provinceName,
      code: provinceCode,
      districtMap: new Map(),
    });
  }
  const province = provinceMap.get(provinceName);

  // Get or create district
  if (!province.districtMap.has(districtName)) {
    province.districtMap.set(districtName, {
      name: districtName,
      code: districtCode,
      wards: [],
    });
  }
  const district = province.districtMap.get(districtName);

  // Add ward (dedup by code)
  const alreadyHasWard = district.wards.some(w => w.code === wardCode && w.name === wardName);
  if (!alreadyHasWard) {
    district.wards.push({
      name: wardName,
      code: wardCode,
    });
  }
}

// ═══════════════════════════════════════════════════
// 4. CONVERT TO FINAL STRUCTURE
// ═══════════════════════════════════════════════════

const provinces = [];

for (const [, prov] of provinceMap) {
  const districts = [];
  for (const [, dist] of prov.districtMap) {
    districts.push({
      name: dist.name,
      code: dist.code,
      wards: dist.wards,
    });
  }
  // Sort districts by name
  districts.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  provinces.push({
    name: prov.name,
    code: prov.code,
    districts,
  });
}

// Sort provinces: TP/Thành phố first, then alphabetical
provinces.sort((a, b) => {
  const aIsCity = a.name.startsWith('Thành phố');
  const bIsCity = b.name.startsWith('Thành phố');
  if (aIsCity && !bIsCity) return -1;
  if (!aIsCity && bIsCity) return 1;
  return a.name.localeCompare(b.name, 'vi');
});

// ═══════════════════════════════════════════════════
// 5. GENERATE TYPESCRIPT FILE
// ═══════════════════════════════════════════════════

const totalDistricts = provinces.reduce((sum, p) => sum + p.districts.length, 0);
const totalWards = provinces.reduce((sum, p) => 
  sum + p.districts.reduce((s, d) => s + d.wards.length, 0), 0);

console.log(`\n📊 KẾT QUẢ:`);
console.log(`   🏙️  Tỉnh/Thành: ${provinces.length}`);
console.log(`   🏘️  Quận/Huyện: ${totalDistricts}`);
console.log(`   🏠 Phường/Xã:  ${totalWards}`);

const tsContent = `// ═══════════════════════════════════════════════════════════════
// VIETNAM LOCATIONS — Bộ dữ liệu địa chính Việt Nam
// Generated from: ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx
// Generated at: ${new Date().toISOString()}
// Stats: ${provinces.length} tỉnh/thành, ${totalDistricts} quận/huyện, ${totalWards} phường/xã
// ═══════════════════════════════════════════════════════════════

export interface Ward {
  name: string;   // "Phường Hoàn Kiếm"
  code: string;   // "10105001"
}

export interface District {
  name: string;   // "Quận Hoàn Kiếm"
  code: string;   // "10105"
  wards: Ward[];
}

export interface Province {
  name: string;   // "Thành phố Hà Nội"
  code: string;   // "01"
  districts: District[];
}

export const VIETNAM_LOCATIONS: Province[] = ${JSON.stringify(provinces, null, 2)};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Lấy danh sách tỉnh/thành (dropdown cấp 1) */
export function getProvinces(): { name: string; code: string }[] {
  return VIETNAM_LOCATIONS.map(p => ({ name: p.name, code: p.code }));
}

/** Lấy quận/huyện theo tỉnh (dropdown cấp 2) */
export function getDistricts(provinceName: string): { name: string; code: string }[] {
  const province = VIETNAM_LOCATIONS.find(p => p.name === provinceName);
  if (!province) return [];
  return province.districts.map(d => ({ name: d.name, code: d.code }));
}

/** Lấy phường/xã theo quận (dropdown cấp 3) */
export function getWards(provinceName: string, districtName: string): { name: string; code: string }[] {
  const province = VIETNAM_LOCATIONS.find(p => p.name === provinceName);
  if (!province) return [];
  const district = province.districts.find(d => d.name === districtName);
  if (!district) return [];
  return district.wards.map(w => ({ name: w.name, code: w.code }));
}

/** Tìm mã theo tên */
export function findCode(provinceName: string, districtName?: string, wardName?: string): {
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
} {
  const province = VIETNAM_LOCATIONS.find(p => p.name === provinceName);
  if (!province) return {};
  
  const result: ReturnType<typeof findCode> = { provinceCode: province.code };
  
  if (districtName) {
    const district = province.districts.find(d => d.name === districtName);
    if (district) {
      result.districtCode = district.code;
      if (wardName) {
        const ward = district.wards.find(w => w.name === wardName);
        if (ward) result.wardCode = ward.code;
      }
    }
  }
  
  return result;
}
`;

// ═══════════════════════════════════════════════════
// 6. WRITE FILE
// ═══════════════════════════════════════════════════

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, tsContent, 'utf-8');

const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
console.log(`\n💾 Đã ghi: ${outputPath}`);
console.log(`📦 Kích thước: ${fileSizeKB} KB`);
console.log(`\n✅ DONE! File vietnam-locations.ts đã sẵn sàng.`);
