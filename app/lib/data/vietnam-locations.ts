// ═══════════════════════════════════════════════════════════════
// VIETNAM LOCATIONS — Bộ dữ liệu địa chính Việt Nam
// Generated from: ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx
// Generated at: 2026-04-02T07:04:23.446Z
// Stats: 35 tỉnh/thành, 692 quận/huyện, 3322 phường/xã
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

export const VIETNAM_LOCATIONS: Province[] = [
  {
    "name": "Thành phố Hà Nội",
    "code": "01",
    "districts": [
      {
        "name": "Huyện Ba Vì",
        "code": "10151",
        "wards": [
          {
            "name": "Xã Minh Châu",
            "code": "10151079"
          },
          {
            "name": "Xã Quảng Oai",
            "code": "10151080"
          },
          {
            "name": "Xã Vật Lại",
            "code": "10151081"
          },
          {
            "name": "Xã Cổ Đô",
            "code": "10151082"
          },
          {
            "name": "Xã Bất Bạt",
            "code": "10151083"
          },
          {
            "name": "Xã Suối Hai",
            "code": "10151084"
          },
          {
            "name": "Xã Ba Vì",
            "code": "10151085"
          },
          {
            "name": "Xã Yên Bài",
            "code": "10151086"
          }
        ]
      },
      {
        "name": "Huyện Chương Mỹ",
        "code": "10153",
        "wards": [
          {
            "name": "Phường Chương Mỹ",
            "code": "10153073"
          },
          {
            "name": "Xã Phú Nghĩa",
            "code": "10153074"
          },
          {
            "name": "Xã Xuân Mai",
            "code": "10153075"
          },
          {
            "name": "Xã Trần Phú",
            "code": "10153076"
          },
          {
            "name": "Xã Hoà Phú",
            "code": "10153077"
          },
          {
            "name": "Xã Quảng Bị",
            "code": "10153078"
          }
        ]
      },
      {
        "name": "Huyện Đan Phượng",
        "code": "10133",
        "wards": [
          {
            "name": "Xã Đan Phượng",
            "code": "10133106"
          },
          {
            "name": "Xã Ô Diên",
            "code": "10133107"
          },
          {
            "name": "Xã Liên Minh",
            "code": "10133108"
          }
        ]
      },
      {
        "name": "Huyện Đông Anh",
        "code": "10117",
        "wards": [
          {
            "name": "Xã Thư Lâm",
            "code": "10117113"
          },
          {
            "name": "Xã Đông Anh",
            "code": "10117114"
          },
          {
            "name": "Xã Phúc Thịnh",
            "code": "10117115"
          },
          {
            "name": "Xã Thiên Lộc",
            "code": "10117116"
          },
          {
            "name": "Xã Vĩnh Thanh",
            "code": "10117117"
          }
        ]
      },
      {
        "name": "Huyện Gia Lâm",
        "code": "10119",
        "wards": [
          {
            "name": "Xã Gia Lâm",
            "code": "10119109"
          },
          {
            "name": "Xã Thuận An",
            "code": "10119110"
          },
          {
            "name": "Xã Bát Tràng",
            "code": "10119111"
          },
          {
            "name": "Xã Phù Đổng",
            "code": "10119112"
          }
        ]
      },
      {
        "name": "Huyện Hoài Đức",
        "code": "10137",
        "wards": [
          {
            "name": "Xã Hoài Đức",
            "code": "10137102"
          },
          {
            "name": "Xã Dương Hoà",
            "code": "10137103"
          },
          {
            "name": "Xã Sơn Đồng",
            "code": "10137104"
          },
          {
            "name": "Xã An Khánh",
            "code": "10137105"
          }
        ]
      },
      {
        "name": "Huyện Mê Linh",
        "code": "10125",
        "wards": [
          {
            "name": "Xã Mê Linh",
            "code": "10125118"
          },
          {
            "name": "Xã Yên Lãng",
            "code": "10125119"
          },
          {
            "name": "Xã Tiến Thắng",
            "code": "10125120"
          },
          {
            "name": "Xã Quang Minh",
            "code": "10125121"
          }
        ]
      },
      {
        "name": "Huyện Mỹ Đức",
        "code": "10145",
        "wards": [
          {
            "name": "Xã Mỹ Đức",
            "code": "10145069"
          },
          {
            "name": "Xã Hồng Sơn",
            "code": "10145070"
          },
          {
            "name": "Xã Phúc Sơn",
            "code": "10145071"
          },
          {
            "name": "Xã Hương Sơn",
            "code": "10145072"
          }
        ]
      },
      {
        "name": "Huyện Phú Xuyên",
        "code": "10149",
        "wards": [
          {
            "name": "Xã Phú Xuyên",
            "code": "10149057"
          },
          {
            "name": "Xã Phượng Dực",
            "code": "10149058"
          },
          {
            "name": "Xã Chuyên Mỹ",
            "code": "10149059"
          },
          {
            "name": "Xã Đại Xuyên",
            "code": "10149060"
          }
        ]
      },
      {
        "name": "Huyện Phúc Thọ",
        "code": "10131",
        "wards": [
          {
            "name": "Xã Phúc Thọ",
            "code": "10131090"
          },
          {
            "name": "Xã Phúc Lộc",
            "code": "10131091"
          },
          {
            "name": "Xã Hát Môn",
            "code": "10131092"
          }
        ]
      },
      {
        "name": "Huyện Quốc Oai",
        "code": "10139",
        "wards": [
          {
            "name": "Xã Quốc Oai",
            "code": "10139098"
          },
          {
            "name": "Xã Hưng Đạo",
            "code": "10139099"
          },
          {
            "name": "Xã Kiều Phú",
            "code": "10139100"
          },
          {
            "name": "Xã Phú Cát",
            "code": "10139101"
          }
        ]
      },
      {
        "name": "Huyện Sóc Sơn",
        "code": "10115",
        "wards": [
          {
            "name": "Xã Sóc Sơn",
            "code": "10115122"
          },
          {
            "name": "Xã Đa Phúc",
            "code": "10115123"
          },
          {
            "name": "Xã Nội Bài",
            "code": "10115124"
          },
          {
            "name": "Xã Trung Giã",
            "code": "10115125"
          },
          {
            "name": "Xã Kim Anh",
            "code": "10115126"
          }
        ]
      },
      {
        "name": "Huyện Thạch Thất",
        "code": "10135",
        "wards": [
          {
            "name": "Xã Thạch Thất",
            "code": "10135093"
          },
          {
            "name": "Xã Hạ Bằng",
            "code": "10135094"
          },
          {
            "name": "Xã Tây Phương",
            "code": "10135095"
          },
          {
            "name": "Xã Hoà Lạc",
            "code": "10135096"
          },
          {
            "name": "Xã Yên Xuân",
            "code": "10135097"
          }
        ]
      },
      {
        "name": "Huyện Thanh Oai",
        "code": "10141",
        "wards": [
          {
            "name": "Xã Thanh Oai",
            "code": "10141061"
          },
          {
            "name": "Xã Bình Minh",
            "code": "10141062"
          },
          {
            "name": "Xã Tam Hưng",
            "code": "10141063"
          },
          {
            "name": "Xã Dân Hoà",
            "code": "10141064"
          }
        ]
      },
      {
        "name": "Huyện Thanh Trì",
        "code": "10123",
        "wards": [
          {
            "name": "Phường Hoàng Liệt",
            "code": "10123020"
          },
          {
            "name": "Xã Thanh Trì",
            "code": "10123048"
          },
          {
            "name": "Xã Đại Thanh",
            "code": "10123049"
          },
          {
            "name": "Xã Nam Phù",
            "code": "10123050"
          },
          {
            "name": "Xã Ngọc Hồi",
            "code": "10123051"
          },
          {
            "name": "Phường Thanh Liệt",
            "code": "10123052"
          }
        ]
      },
      {
        "name": "Huyện Thường Tín",
        "code": "10143",
        "wards": [
          {
            "name": "Xã Thượng Phúc",
            "code": "10143053"
          },
          {
            "name": "Xã Thường Tín",
            "code": "10143054"
          },
          {
            "name": "Xã Chương Dương",
            "code": "10143055"
          },
          {
            "name": "Xã Hồng Vân",
            "code": "10143056"
          }
        ]
      },
      {
        "name": "Huyện Ứng Hoà",
        "code": "10147",
        "wards": [
          {
            "name": "Xã Vân Đình",
            "code": "10147065"
          },
          {
            "name": "Xã Ứng Thiên",
            "code": "10147066"
          },
          {
            "name": "Xã Hoà Xá",
            "code": "10147067"
          },
          {
            "name": "Xã Ứng Hoà",
            "code": "10147068"
          }
        ]
      },
      {
        "name": "Quận Ba Đình",
        "code": "10101",
        "wards": [
          {
            "name": "Phường Ba Đình",
            "code": "10101003"
          },
          {
            "name": "Phường Ngọc Hà",
            "code": "10101004"
          },
          {
            "name": "Phường Giảng Võ",
            "code": "10101005"
          }
        ]
      },
      {
        "name": "Quận Bắc Từ Liêm",
        "code": "10157",
        "wards": [
          {
            "name": "Phường Phú Thượng",
            "code": "10157029"
          },
          {
            "name": "Phường Tây Tựu",
            "code": "10157030"
          },
          {
            "name": "Phường Phú Diễn",
            "code": "10157031"
          },
          {
            "name": "Phường Xuân Đỉnh",
            "code": "10157032"
          },
          {
            "name": "Phường Đông Ngạc",
            "code": "10157033"
          },
          {
            "name": "Phường Thượng Cát",
            "code": "10157034"
          }
        ]
      },
      {
        "name": "Quận Cầu Giấy",
        "code": "10113",
        "wards": [
          {
            "name": "Phường Cầu Giấy",
            "code": "10113025"
          },
          {
            "name": "Phường Nghĩa Đô",
            "code": "10113026"
          },
          {
            "name": "Phường Yên Hoà",
            "code": "10113027"
          }
        ]
      },
      {
        "name": "Quận Đống Đa",
        "code": "10109",
        "wards": [
          {
            "name": "Phường Đống Đa",
            "code": "10109009"
          },
          {
            "name": "Phường Kim Liên",
            "code": "10109010"
          },
          {
            "name": "Phường Văn Miếu - Quốc Tử Giám",
            "code": "10109011"
          },
          {
            "name": "Phường Láng",
            "code": "10109012"
          },
          {
            "name": "Phường Ô Chợ Dừa",
            "code": "10109013"
          }
        ]
      },
      {
        "name": "Quận Hà Đông",
        "code": "10127",
        "wards": [
          {
            "name": "Phường Hà Đông",
            "code": "10127043"
          },
          {
            "name": "Phường Dương Nội",
            "code": "10127044"
          },
          {
            "name": "Phường Yên Nghĩa",
            "code": "10127045"
          },
          {
            "name": "Phường Phú Lương",
            "code": "10127046"
          },
          {
            "name": "Phường Kiến Hưng",
            "code": "10127047"
          }
        ]
      },
      {
        "name": "Quận Hai Bà Trưng",
        "code": "10107",
        "wards": [
          {
            "name": "Phường Hai Bà Trưng",
            "code": "10107006"
          },
          {
            "name": "Phường Vĩnh Tuy",
            "code": "10107007"
          },
          {
            "name": "Phường Bạch Mai",
            "code": "10107008"
          }
        ]
      },
      {
        "name": "Quận Hoàn Kiếm",
        "code": "10105",
        "wards": [
          {
            "name": "Phường Hoàn Kiếm",
            "code": "10105001"
          },
          {
            "name": "Phường Cửa Nam",
            "code": "10105002"
          }
        ]
      },
      {
        "name": "Quận Hoàng Mai",
        "code": "10108",
        "wards": [
          {
            "name": "Phường Lĩnh Nam",
            "code": "10108015"
          },
          {
            "name": "Phường Hoàng Mai",
            "code": "10108016"
          },
          {
            "name": "Phường Vĩnh Hưng",
            "code": "10108017"
          },
          {
            "name": "Phường Tương Mai",
            "code": "10108018"
          },
          {
            "name": "Phường Định Công",
            "code": "10108019"
          },
          {
            "name": "Phường Yên Sở",
            "code": "10108021"
          }
        ]
      },
      {
        "name": "Quận Long Biên",
        "code": "10106",
        "wards": [
          {
            "name": "Phường Long Biên",
            "code": "10106039"
          },
          {
            "name": "Phường Bồ Đề",
            "code": "10106040"
          },
          {
            "name": "Phường Việt Hưng",
            "code": "10106041"
          },
          {
            "name": "Phường Phúc Lợi",
            "code": "10106042"
          }
        ]
      },
      {
        "name": "Quận Nam Từ Liêm",
        "code": "10155",
        "wards": [
          {
            "name": "Phường Từ Liêm",
            "code": "10155035"
          },
          {
            "name": "Phường Xuân Phương",
            "code": "10155036"
          },
          {
            "name": "Phường Tây Mỗ",
            "code": "10155037"
          },
          {
            "name": "Phường Đại Mỗ",
            "code": "10155038"
          }
        ]
      },
      {
        "name": "Quận Tây Hồ",
        "code": "10103",
        "wards": [
          {
            "name": "Phường Hồng Hà",
            "code": "10103014"
          },
          {
            "name": "Phường Tây Hồ",
            "code": "10103028"
          }
        ]
      },
      {
        "name": "Quận Thanh Xuân",
        "code": "10111",
        "wards": [
          {
            "name": "Phường Thanh Xuân",
            "code": "10111022"
          },
          {
            "name": "Phường Khương Đình",
            "code": "10111023"
          },
          {
            "name": "Phường Phương Liệt",
            "code": "10111024"
          }
        ]
      },
      {
        "name": "Thị xã Sơn Tây",
        "code": "10129",
        "wards": [
          {
            "name": "Phường Sơn Tây",
            "code": "10129087"
          },
          {
            "name": "Phường Tùng Thiện",
            "code": "10129088"
          },
          {
            "name": "Xã Đoài Phương",
            "code": "10129089"
          }
        ]
      }
    ]
  },
  {
    "name": "Thành phố Huế",
    "code": "20",
    "districts": [
      {
        "name": "Huyện A Lưới",
        "code": "41115",
        "wards": [
          {
            "name": "Xã A Lưới 1",
            "code": "41115035"
          },
          {
            "name": "Xã A Lưới 2",
            "code": "41115036"
          },
          {
            "name": "Xã A Lưới 3",
            "code": "41115037"
          },
          {
            "name": "Xã A Lưới 4",
            "code": "41115038"
          },
          {
            "name": "Xã A Lưới 5",
            "code": "41115039"
          }
        ]
      },
      {
        "name": "Huyện Phú Lộc",
        "code": "41113",
        "wards": [
          {
            "name": "Xã Vinh Lộc",
            "code": "41113026"
          },
          {
            "name": "Xã Hưng Lộc",
            "code": "41113027"
          },
          {
            "name": "Xã Lộc An",
            "code": "41113028"
          },
          {
            "name": "Xã Phú Lộc",
            "code": "41113029"
          },
          {
            "name": "Xã Chân Mây – Lăng Cô",
            "code": "41113030"
          },
          {
            "name": "Xã Long Quảng",
            "code": "41113031"
          },
          {
            "name": "Xã Nam Đông",
            "code": "41113032"
          },
          {
            "name": "Xã Khe Tre",
            "code": "41113033"
          }
        ]
      },
      {
        "name": "Huyện Phú Vang",
        "code": "41109",
        "wards": [
          {
            "name": "Phường Thuận An",
            "code": "41109001"
          },
          {
            "name": "Phường Mỹ Thượng",
            "code": "41109003"
          },
          {
            "name": "Xã Phú Vinh",
            "code": "41109023"
          },
          {
            "name": "Xã Phú Hồ",
            "code": "41109024"
          },
          {
            "name": "Xã Phú Vang",
            "code": "41109025"
          }
        ]
      },
      {
        "name": "Huyện Quảng Điền",
        "code": "41105",
        "wards": [
          {
            "name": "Phường Phong Quảng",
            "code": "41105020"
          },
          {
            "name": "Xã Đan Điền",
            "code": "41105021"
          },
          {
            "name": "Xã Quảng Điền",
            "code": "41105022"
          }
        ]
      },
      {
        "name": "Quận Phú Xuân",
        "code": "41119",
        "wards": [
          {
            "name": "Phường Hóa Châu",
            "code": "41119002"
          },
          {
            "name": "Phường Kim Long",
            "code": "41119008"
          },
          {
            "name": "Phường Hương An",
            "code": "41119009"
          },
          {
            "name": "Phường Phú Xuân",
            "code": "41119010"
          }
        ]
      },
      {
        "name": "Quận Thuận Hóa",
        "code": "41101",
        "wards": [
          {
            "name": "Phường Vỹ Dạ",
            "code": "41101004"
          },
          {
            "name": "Phường Thuận Hóa",
            "code": "41101005"
          },
          {
            "name": "Phường An Cựu",
            "code": "41101006"
          },
          {
            "name": "Phường Thủy Xuân",
            "code": "41101007"
          },
          {
            "name": "Phường Dương Nỗ",
            "code": "41101040"
          }
        ]
      },
      {
        "name": "Thị xã Hương Thuỷ",
        "code": "41111",
        "wards": [
          {
            "name": "Phường Thanh Thủy",
            "code": "41111013"
          },
          {
            "name": "Phường Hương Thủy",
            "code": "41111014"
          },
          {
            "name": "Phường Phú Bài",
            "code": "41111015"
          }
        ]
      },
      {
        "name": "Thị xã Hương Trà",
        "code": "41107",
        "wards": [
          {
            "name": "Phường Hương Trà",
            "code": "41107011"
          },
          {
            "name": "Phường Kim Trà",
            "code": "41107012"
          },
          {
            "name": "Xã Bình Điền",
            "code": "41107034"
          }
        ]
      },
      {
        "name": "Thị xã Phong Điền",
        "code": "41103",
        "wards": [
          {
            "name": "Phường Phong Điền",
            "code": "41103016"
          },
          {
            "name": "Phường Phong Thái",
            "code": "41103017"
          },
          {
            "name": "Phường Phong Dinh",
            "code": "41103018"
          },
          {
            "name": "Phường Phong Phú",
            "code": "41103019"
          }
        ]
      }
    ]
  },
  {
    "name": "Tên tỉnh/TP mới",
    "code": "Mã tỉnh (BNV)",
    "districts": [
      {
        "name": "Tên Quận huyện TMS (cũ)",
        "code": "Mã Quận huyện TMS (cũ) CQT đã rà soát",
        "wards": [
          {
            "name": "Tên Phường/Xã mới",
            "code": "Mã phường/xã mới"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh An Giang",
    "code": "32",
    "districts": [
      {
        "name": "Huyện An Biên",
        "code": "81315",
        "wards": [
          {
            "name": "Xã Tây Yên",
            "code": "81315065"
          },
          {
            "name": "Xã Đông Thái",
            "code": "81315066"
          },
          {
            "name": "Xã An Biên",
            "code": "81315067"
          }
        ]
      },
      {
        "name": "Huyện An Minh",
        "code": "81317",
        "wards": [
          {
            "name": "Xã Đông Hoà",
            "code": "81317060"
          },
          {
            "name": "Xã Tân Thạnh",
            "code": "81317061"
          },
          {
            "name": "Xã Đông Hưng",
            "code": "81317062"
          },
          {
            "name": "Xã An Minh",
            "code": "81317063"
          },
          {
            "name": "Xã Vân Khánh",
            "code": "81317064"
          }
        ]
      },
      {
        "name": "Huyện An Phú",
        "code": "80505",
        "wards": [
          {
            "name": "Xã An Phú",
            "code": "80505007"
          },
          {
            "name": "Xã Vĩnh Hậu",
            "code": "80505008"
          },
          {
            "name": "Xã Nhơn Hội",
            "code": "80505009"
          },
          {
            "name": "Xã Khánh Bình",
            "code": "80505010"
          },
          {
            "name": "Xã Phú Hữu",
            "code": "80505011"
          }
        ]
      },
      {
        "name": "Huyện Châu Phú",
        "code": "80511",
        "wards": [
          {
            "name": "Xã Châu Phú",
            "code": "80511023"
          },
          {
            "name": "Xã Mỹ Đức",
            "code": "80511024"
          },
          {
            "name": "Xã Vĩnh Thạnh Trung",
            "code": "80511025"
          },
          {
            "name": "Xã Bình Mỹ",
            "code": "80511026"
          },
          {
            "name": "Xã Thạnh Mỹ Tây",
            "code": "80511027"
          }
        ]
      },
      {
        "name": "Huyện Châu Thành",
        "code": "80519",
        "wards": [
          {
            "name": "Xã An Châu",
            "code": "80519038"
          },
          {
            "name": "Xã Bình Hoà",
            "code": "80519039"
          },
          {
            "name": "Xã Cần Đăng",
            "code": "80519040"
          },
          {
            "name": "Xã Vĩnh Hanh",
            "code": "80519041"
          },
          {
            "name": "Xã Vĩnh An",
            "code": "80519042"
          },
          {
            "name": "Xã Thạnh Lộc",
            "code": "81309081"
          },
          {
            "name": "Xã Châu Thành",
            "code": "81309082"
          },
          {
            "name": "Xã Bình An",
            "code": "81309083"
          }
        ]
      },
      {
        "name": "Huyện Chợ Mới",
        "code": "80517",
        "wards": [
          {
            "name": "Xã Chợ Mới",
            "code": "80517043"
          },
          {
            "name": "Xã Cù Lao Giêng",
            "code": "80517044"
          },
          {
            "name": "Xã Hội An",
            "code": "80517045"
          },
          {
            "name": "Xã Long Điền",
            "code": "80517046"
          },
          {
            "name": "Xã Nhơn Mỹ",
            "code": "80517047"
          },
          {
            "name": "Xã Long Kiến",
            "code": "80517048"
          }
        ]
      },
      {
        "name": "Huyện Giang Thành",
        "code": "81304",
        "wards": [
          {
            "name": "Xã Giang Thành",
            "code": "81304089"
          },
          {
            "name": "Xã Vĩnh Điều",
            "code": "81304090"
          }
        ]
      },
      {
        "name": "Huyện Giồng Riềng",
        "code": "81311",
        "wards": [
          {
            "name": "Xã Giồng Riềng",
            "code": "81311072"
          },
          {
            "name": "Xã Thạnh Hưng",
            "code": "81311073"
          },
          {
            "name": "Xã Long Thạnh",
            "code": "81311074"
          },
          {
            "name": "Xã Hoà Hưng",
            "code": "81311075"
          },
          {
            "name": "Xã Ngọc Chúc",
            "code": "81311076"
          },
          {
            "name": "Xã Hoà Thuận",
            "code": "81311077"
          }
        ]
      },
      {
        "name": "Huyện Gò Quao",
        "code": "81313",
        "wards": [
          {
            "name": "Xã Định Hoà",
            "code": "81313068"
          },
          {
            "name": "Xã Gò Quao",
            "code": "81313069"
          },
          {
            "name": "Xã Vĩnh Hoà Hưng",
            "code": "81313070"
          },
          {
            "name": "Xã Vĩnh Tuy",
            "code": "81313071"
          }
        ]
      },
      {
        "name": "Huyện Hòn Đất",
        "code": "81305",
        "wards": [
          {
            "name": "Xã Hòn Đất",
            "code": "81305084"
          },
          {
            "name": "Xã Sơn Kiên",
            "code": "81305085"
          },
          {
            "name": "Xã Mỹ Thuận",
            "code": "81305086"
          },
          {
            "name": "Xã Bình Sơn",
            "code": "81305087"
          },
          {
            "name": "Xã Bình Giang",
            "code": "81305088"
          }
        ]
      },
      {
        "name": "Huyện Kiên Hải",
        "code": "81323",
        "wards": [
          {
            "name": "Đặc khu Kiên Hải",
            "code": "81323095"
          }
        ]
      },
      {
        "name": "Huyện Kiên Lương",
        "code": "81303",
        "wards": [
          {
            "name": "Xã Hoà Điền",
            "code": "81303091"
          },
          {
            "name": "Xã Kiên Lương",
            "code": "81303092"
          },
          {
            "name": "Xã Sơn Hải",
            "code": "81303093"
          },
          {
            "name": "Xã Hòn Nghệ",
            "code": "81303094"
          }
        ]
      },
      {
        "name": "Huyện Phú Tân",
        "code": "80509",
        "wards": [
          {
            "name": "Xã Phú Tân",
            "code": "80509017"
          },
          {
            "name": "Xã Phú An",
            "code": "80509018"
          },
          {
            "name": "Xã Bình Thạnh Đông",
            "code": "80509019"
          },
          {
            "name": "Xã Chợ Vàm",
            "code": "80509020"
          },
          {
            "name": "Xã Hoà Lạc",
            "code": "80509021"
          },
          {
            "name": "Xã Phú Lâm",
            "code": "80509022"
          }
        ]
      },
      {
        "name": "Huyện Tân Hiệp",
        "code": "81307",
        "wards": [
          {
            "name": "Xã Tân Hội",
            "code": "81307078"
          },
          {
            "name": "Xã Tân Hiệp",
            "code": "81307079"
          },
          {
            "name": "Xã Thạnh Đông",
            "code": "81307080"
          }
        ]
      },
      {
        "name": "Huyện Thoại Sơn",
        "code": "80521",
        "wards": [
          {
            "name": "Xã Thoại Sơn",
            "code": "80521049"
          },
          {
            "name": "Xã Óc Eo",
            "code": "80521050"
          },
          {
            "name": "Xã Định Mỹ",
            "code": "80521051"
          },
          {
            "name": "Xã Phú Hoà",
            "code": "80521052"
          },
          {
            "name": "Xã Vĩnh Trạch",
            "code": "80521053"
          },
          {
            "name": "Xã Tây Phú",
            "code": "80521054"
          }
        ]
      },
      {
        "name": "Huyện Tri Tôn",
        "code": "80515",
        "wards": [
          {
            "name": "Xã Ba Chúc",
            "code": "80515033"
          },
          {
            "name": "Xã Tri Tôn",
            "code": "80515034"
          },
          {
            "name": "Xã Ô Lâm",
            "code": "80515035"
          },
          {
            "name": "Xã Cô Tô",
            "code": "80515036"
          },
          {
            "name": "Xã Vĩnh Gia",
            "code": "80515037"
          }
        ]
      },
      {
        "name": "Huyện U Minh Thượng",
        "code": "81327",
        "wards": [
          {
            "name": "Xã Vĩnh Hoà",
            "code": "81327058"
          },
          {
            "name": "Xã U Minh Thượng",
            "code": "81327059"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Thuận",
        "code": "81319",
        "wards": [
          {
            "name": "Xã Vĩnh Bình",
            "code": "81319055"
          },
          {
            "name": "Xã Vĩnh Thuận",
            "code": "81319056"
          },
          {
            "name": "Xã Vĩnh Phong",
            "code": "81319057"
          }
        ]
      },
      {
        "name": "Thành phố Châu Đốc",
        "code": "80503",
        "wards": [
          {
            "name": "Phường Châu Đốc",
            "code": "80503005"
          },
          {
            "name": "Phường Vĩnh Tế",
            "code": "80503006"
          }
        ]
      },
      {
        "name": "Thành phố Hà Tiên",
        "code": "81325",
        "wards": [
          {
            "name": "Phường Hà Tiên",
            "code": "81325098"
          },
          {
            "name": "Phường Tô Châu",
            "code": "81325099"
          },
          {
            "name": "Xã Tiên Hải",
            "code": "81325100"
          }
        ]
      },
      {
        "name": "Thành phố Long Xuyên",
        "code": "80501",
        "wards": [
          {
            "name": "Xã Mỹ Hoà Hưng",
            "code": "80501001"
          },
          {
            "name": "Phường Long Xuyên",
            "code": "80501002"
          },
          {
            "name": "Phường Bình Đức",
            "code": "80501003"
          },
          {
            "name": "Phường Mỹ Thới",
            "code": "80501004"
          }
        ]
      },
      {
        "name": "Thành phố Phú Quốc",
        "code": "81321",
        "wards": [
          {
            "name": "Đặc khu Phú Quốc",
            "code": "81321101"
          },
          {
            "name": "Đặc khu Thổ Châu",
            "code": "81321102"
          }
        ]
      },
      {
        "name": "Thành phố Rạch Giá",
        "code": "81301",
        "wards": [
          {
            "name": "Phường Vĩnh Thông",
            "code": "81301096"
          },
          {
            "name": "Phường Rạch Giá",
            "code": "81301097"
          }
        ]
      },
      {
        "name": "Thị xã Tân Châu",
        "code": "80507",
        "wards": [
          {
            "name": "Xã Tân An",
            "code": "80507012"
          },
          {
            "name": "Xã Châu Phong",
            "code": "80507013"
          },
          {
            "name": "Xã Vĩnh Xương",
            "code": "80507014"
          },
          {
            "name": "Phường Tân Châu",
            "code": "80507015"
          },
          {
            "name": "Phường Long Phú",
            "code": "80507016"
          }
        ]
      },
      {
        "name": "Thị xã Tịnh Biên",
        "code": "80513",
        "wards": [
          {
            "name": "Xã An Cư",
            "code": "80513028"
          },
          {
            "name": "Xã Núi Cấm",
            "code": "80513029"
          },
          {
            "name": "Phường Tịnh Biên",
            "code": "80513030"
          },
          {
            "name": "Phường Thới Sơn",
            "code": "80513031"
          },
          {
            "name": "Phường Chi Lăng",
            "code": "80513032"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Bắc Ninh",
    "code": "02",
    "districts": [
      {
        "name": "Huyện Gia Bình",
        "code": "22315",
        "wards": [
          {
            "name": "Xã Gia Bình",
            "code": "22315090"
          },
          {
            "name": "Xã Nhân Thắng",
            "code": "22315091"
          },
          {
            "name": "Xã Đại Lai",
            "code": "22315092"
          },
          {
            "name": "Xã Cao Đức",
            "code": "22315093"
          },
          {
            "name": "Xã Đông Cứu",
            "code": "22315094"
          }
        ]
      },
      {
        "name": "Huyện Hiệp Hoà",
        "code": "22109",
        "wards": [
          {
            "name": "Xã Hợp Thịnh",
            "code": "22109042"
          },
          {
            "name": "Xã Hiệp Hoà",
            "code": "22109043"
          },
          {
            "name": "Xã Hoàng Vân",
            "code": "22109044"
          },
          {
            "name": "Xã Xuân Cẩm",
            "code": "22109045"
          }
        ]
      },
      {
        "name": "Huyện Lạng Giang",
        "code": "22111",
        "wards": [
          {
            "name": "Xã Lạng Giang",
            "code": "22111027"
          },
          {
            "name": "Xã Mỹ Thái",
            "code": "22111028"
          },
          {
            "name": "Xã Kép",
            "code": "22111029"
          },
          {
            "name": "Xã Tân Dĩnh",
            "code": "22111030"
          },
          {
            "name": "Xã Tiên Lục",
            "code": "22111031"
          }
        ]
      },
      {
        "name": "Huyện Lục Nam",
        "code": "22115",
        "wards": [
          {
            "name": "Xã Lục Sơn",
            "code": "22115019"
          },
          {
            "name": "Xã Trường Sơn",
            "code": "22115020"
          },
          {
            "name": "Xã Cẩm Lý",
            "code": "22115021"
          },
          {
            "name": "Xã Đông Phú",
            "code": "22115022"
          },
          {
            "name": "Xã Nghĩa Phương",
            "code": "22115023"
          },
          {
            "name": "Xã Lục Nam",
            "code": "22115024"
          },
          {
            "name": "Xã Bắc Lũng",
            "code": "22115025"
          },
          {
            "name": "Xã Bảo Đài",
            "code": "22115026"
          }
        ]
      },
      {
        "name": "Huyện Lục Ngạn",
        "code": "22107",
        "wards": [
          {
            "name": "Xã Biển Động",
            "code": "22107008"
          },
          {
            "name": "Xã Lục Ngạn",
            "code": "22107009"
          },
          {
            "name": "Xã Đèo Gia",
            "code": "22107010"
          },
          {
            "name": "Xã Sơn Hải",
            "code": "22107011"
          },
          {
            "name": "Xã Tân Sơn",
            "code": "22107012"
          },
          {
            "name": "Xã Biên Sơn",
            "code": "22107013"
          },
          {
            "name": "Xã Sa Lý",
            "code": "22107014"
          },
          {
            "name": "Xã Nam Dương",
            "code": "22107015"
          }
        ]
      },
      {
        "name": "Huyện Lương Tài",
        "code": "22311",
        "wards": [
          {
            "name": "Xã Lương Tài",
            "code": "22311095"
          },
          {
            "name": "Xã Lâm Thao",
            "code": "22311096"
          },
          {
            "name": "Xã Trung Chính",
            "code": "22311097"
          },
          {
            "name": "Xã Trung Kênh",
            "code": "22311098"
          }
        ]
      },
      {
        "name": "Huyện Sơn Động",
        "code": "22113",
        "wards": [
          {
            "name": "Xã Đại Sơn",
            "code": "22113001"
          },
          {
            "name": "Xã Sơn Động",
            "code": "22113002"
          },
          {
            "name": "Xã Tây Yên Tử",
            "code": "22113003"
          },
          {
            "name": "Xã Dương Hưu",
            "code": "22113004"
          },
          {
            "name": "Xã Yên Định",
            "code": "22113005"
          },
          {
            "name": "Xã An Lạc",
            "code": "22113006"
          },
          {
            "name": "Xã Vân Sơn",
            "code": "22113007"
          },
          {
            "name": "Xã Tuấn Đạo",
            "code": "22113099"
          }
        ]
      },
      {
        "name": "Huyện Tân Yên",
        "code": "22105",
        "wards": [
          {
            "name": "Xã Tân Yên",
            "code": "22105037"
          },
          {
            "name": "Xã Ngọc Thiện",
            "code": "22105038"
          },
          {
            "name": "Xã Nhã Nam",
            "code": "22105039"
          },
          {
            "name": "Xã Phúc Hoà",
            "code": "22105040"
          },
          {
            "name": "Xã Quang Trung",
            "code": "22105041"
          }
        ]
      },
      {
        "name": "Huyện Tiên Du",
        "code": "22307",
        "wards": [
          {
            "name": "Xã Tiên Du",
            "code": "22307085"
          },
          {
            "name": "Xã Liên Bão",
            "code": "22307086"
          },
          {
            "name": "Xã Tân Chi",
            "code": "22307087"
          },
          {
            "name": "Xã Đại Đồng",
            "code": "22307088"
          },
          {
            "name": "Xã Phật Tích",
            "code": "22307089"
          }
        ]
      },
      {
        "name": "Huyện Yên Phong",
        "code": "22303",
        "wards": [
          {
            "name": "Xã Yên Phong",
            "code": "22303080"
          },
          {
            "name": "Xã Văn Môn",
            "code": "22303081"
          },
          {
            "name": "Xã Tam Giang",
            "code": "22303082"
          },
          {
            "name": "Xã Yên Trung",
            "code": "22303083"
          },
          {
            "name": "Xã Tam Đa",
            "code": "22303084"
          }
        ]
      },
      {
        "name": "Huyện Yên Thế",
        "code": "22103",
        "wards": [
          {
            "name": "Xã Yên Thế",
            "code": "22103032"
          },
          {
            "name": "Xã Bố Hạ",
            "code": "22103033"
          },
          {
            "name": "Xã Đồng Kỳ",
            "code": "22103034"
          },
          {
            "name": "Xã Xuân Lương",
            "code": "22103035"
          },
          {
            "name": "Xã Tam Tiến",
            "code": "22103036"
          }
        ]
      },
      {
        "name": "Thành phố Bắc Giang",
        "code": "22101",
        "wards": [
          {
            "name": "Xã Đồng Việt",
            "code": "22101050"
          },
          {
            "name": "Phường Bắc Giang",
            "code": "22101051"
          },
          {
            "name": "Phường Đa Mai",
            "code": "22101052"
          },
          {
            "name": "Phường Tiền Phong",
            "code": "22101053"
          },
          {
            "name": "Phường Tân An",
            "code": "22101054"
          },
          {
            "name": "Phường Yên Dũng",
            "code": "22101055"
          },
          {
            "name": "Phường Tân Tiến",
            "code": "22101056"
          },
          {
            "name": "Phường Cảnh Thụy",
            "code": "22101057"
          }
        ]
      },
      {
        "name": "Thành phố Bắc Ninh",
        "code": "22301",
        "wards": [
          {
            "name": "Phường Kinh Bắc",
            "code": "22301058"
          },
          {
            "name": "Phường Võ Cường",
            "code": "22301059"
          },
          {
            "name": "Phường Vũ Ninh",
            "code": "22301060"
          },
          {
            "name": "Phường Hạp Lĩnh",
            "code": "22301061"
          },
          {
            "name": "Phường Nam Sơn",
            "code": "22301062"
          }
        ]
      },
      {
        "name": "Thị xã Chũ",
        "code": "22121",
        "wards": [
          {
            "name": "Xã Kiên Lao",
            "code": "22121016"
          },
          {
            "name": "Phường Chũ",
            "code": "22121017"
          },
          {
            "name": "Phường Phượng Sơn",
            "code": "22121018"
          }
        ]
      },
      {
        "name": "Thị xã Quế Võ",
        "code": "22305",
        "wards": [
          {
            "name": "Phường Quế Võ",
            "code": "22305073"
          },
          {
            "name": "Phường Phương Liễu",
            "code": "22305074"
          },
          {
            "name": "Phường Nhân Hoà",
            "code": "22305075"
          },
          {
            "name": "Phường Đào Viên",
            "code": "22305076"
          },
          {
            "name": "Phường Bồng Lai",
            "code": "22305077"
          },
          {
            "name": "Xã Chi Lăng",
            "code": "22305078"
          },
          {
            "name": "Xã Phù Lãng",
            "code": "22305079"
          }
        ]
      },
      {
        "name": "Thị xã Thuận Thành",
        "code": "22309",
        "wards": [
          {
            "name": "Phường Thuận Thành",
            "code": "22309067"
          },
          {
            "name": "Phường Mão Điền",
            "code": "22309068"
          },
          {
            "name": "Phường Trạm Lộ",
            "code": "22309069"
          },
          {
            "name": "Phường Trí Quả",
            "code": "22309070"
          },
          {
            "name": "Phường Song Liễu",
            "code": "22309071"
          },
          {
            "name": "Phường Ninh Xá",
            "code": "22309072"
          }
        ]
      },
      {
        "name": "Thị xã Từ Sơn",
        "code": "22313",
        "wards": [
          {
            "name": "Phường Từ Sơn",
            "code": "22313063"
          },
          {
            "name": "Phường Tam Sơn",
            "code": "22313064"
          },
          {
            "name": "Phường Đồng Nguyên",
            "code": "22313065"
          },
          {
            "name": "Phường Phù Khê",
            "code": "22313066"
          }
        ]
      },
      {
        "name": "Thị xã Việt Yên",
        "code": "22117",
        "wards": [
          {
            "name": "Phường Tự Lạn",
            "code": "22117046"
          },
          {
            "name": "Phường Việt Yên",
            "code": "22117047"
          },
          {
            "name": "Phường Nếnh",
            "code": "22117048"
          },
          {
            "name": "Phường Vân Hà",
            "code": "22117049"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Cà Mau",
    "code": "34",
    "districts": [
      {
        "name": "Huyện Cái Nước",
        "code": "82309",
        "wards": [
          {
            "name": "Xã Lương Thế Trân",
            "code": "82309036"
          },
          {
            "name": "Xã Tân Hưng",
            "code": "82309037"
          },
          {
            "name": "Xã Hưng Mỹ",
            "code": "82309038"
          },
          {
            "name": "Xã Cái Nước",
            "code": "82309039"
          }
        ]
      },
      {
        "name": "Huyện Đầm Dơi",
        "code": "82311",
        "wards": [
          {
            "name": "Xã Tân Thuận",
            "code": "82311005"
          },
          {
            "name": "Xã Tân Tiến",
            "code": "82311006"
          },
          {
            "name": "Xã Tạ An Khương",
            "code": "82311007"
          },
          {
            "name": "Xã Trần Phán",
            "code": "82311008"
          },
          {
            "name": "Xã Thanh Tùng",
            "code": "82311009"
          },
          {
            "name": "Xã Đầm Dơi",
            "code": "82311010"
          },
          {
            "name": "Xã Quách Phẩm",
            "code": "82311011"
          }
        ]
      },
      {
        "name": "Huyện Đông Hải",
        "code": "82111",
        "wards": [
          {
            "name": "Xã Gành Hào",
            "code": "82111050"
          },
          {
            "name": "Xã Định Thành",
            "code": "82111051"
          },
          {
            "name": "Xã An Trạch",
            "code": "82111052"
          },
          {
            "name": "Xã Long Điền",
            "code": "82111053"
          },
          {
            "name": "Xã Đông Hải",
            "code": "82111054"
          }
        ]
      },
      {
        "name": "Huyện Hoà Bình",
        "code": "82106",
        "wards": [
          {
            "name": "Xã Hoà Bình",
            "code": "82106055"
          },
          {
            "name": "Xã Vĩnh Mỹ",
            "code": "82106056"
          },
          {
            "name": "Xã Vĩnh Hậu",
            "code": "82106057"
          }
        ]
      },
      {
        "name": "Huyện Hồng Dân",
        "code": "82103",
        "wards": [
          {
            "name": "Xã Hồng Dân",
            "code": "82103046"
          },
          {
            "name": "Xã Vĩnh Lộc",
            "code": "82103047"
          },
          {
            "name": "Xã Ninh Thạnh Lợi",
            "code": "82103048"
          },
          {
            "name": "Xã Ninh Quới",
            "code": "82103049"
          }
        ]
      },
      {
        "name": "Huyện Năm Căn",
        "code": "82312",
        "wards": [
          {
            "name": "Xã Đất Mới",
            "code": "82312029"
          },
          {
            "name": "Xã Năm Căn",
            "code": "82312030"
          },
          {
            "name": "Xã Tam Giang",
            "code": "82312031"
          }
        ]
      },
      {
        "name": "Huyện Ngọc Hiển",
        "code": "82313",
        "wards": [
          {
            "name": "Xã Phan Ngọc Hiển",
            "code": "82313016"
          },
          {
            "name": "Xã Đất Mũi",
            "code": "82313017"
          },
          {
            "name": "Xã Tân Ân",
            "code": "82313018"
          }
        ]
      },
      {
        "name": "Huyện Phú Tân",
        "code": "82308",
        "wards": [
          {
            "name": "Xã Cái Đôi Vàm",
            "code": "82308032"
          },
          {
            "name": "Xã Nguyễn Việt Khái",
            "code": "82308033"
          },
          {
            "name": "Xã Phú Tân",
            "code": "82308034"
          },
          {
            "name": "Xã Phú Mỹ",
            "code": "82308035"
          }
        ]
      },
      {
        "name": "Huyện Phước Long",
        "code": "82109",
        "wards": [
          {
            "name": "Xã Phước Long",
            "code": "82109058"
          },
          {
            "name": "Xã Vĩnh Phước",
            "code": "82109059"
          },
          {
            "name": "Xã Phong Hiệp",
            "code": "82109060"
          },
          {
            "name": "Xã Vĩnh Thanh",
            "code": "82109061"
          }
        ]
      },
      {
        "name": "Huyện Thới Bình",
        "code": "82303",
        "wards": [
          {
            "name": "Xã Thới Bình",
            "code": "82303024"
          },
          {
            "name": "Xã Trí Phải",
            "code": "82303025"
          },
          {
            "name": "Xã Tân Lộc",
            "code": "82303026"
          },
          {
            "name": "Xã Hồ Thị Kỷ",
            "code": "82303027"
          },
          {
            "name": "Xã Biển Bạch",
            "code": "82303028"
          }
        ]
      },
      {
        "name": "Huyện Trần Văn Thời",
        "code": "82307",
        "wards": [
          {
            "name": "Xã Khánh Bình",
            "code": "82307019"
          },
          {
            "name": "Xã Đá Bạc",
            "code": "82307020"
          },
          {
            "name": "Xã Khánh Hưng",
            "code": "82307021"
          },
          {
            "name": "Xã Sông Đốc",
            "code": "82307022"
          },
          {
            "name": "Xã Trần Văn Thời",
            "code": "82307023"
          }
        ]
      },
      {
        "name": "Huyện U Minh",
        "code": "82305",
        "wards": [
          {
            "name": "Xã U Minh",
            "code": "82305012"
          },
          {
            "name": "Xã Nguyễn Phích",
            "code": "82305013"
          },
          {
            "name": "Xã Khánh Lâm",
            "code": "82305014"
          },
          {
            "name": "Xã Khánh An",
            "code": "82305015"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Lợi",
        "code": "82105",
        "wards": [
          {
            "name": "Xã Vĩnh Lợi",
            "code": "82105062"
          },
          {
            "name": "Xã Hưng Hội",
            "code": "82105063"
          },
          {
            "name": "Xã Châu Thới",
            "code": "82105064"
          }
        ]
      },
      {
        "name": "Thành phố Bạc Liêu",
        "code": "82101",
        "wards": [
          {
            "name": "Phường Bạc Liêu",
            "code": "82101040"
          },
          {
            "name": "Phường Vĩnh Trạch",
            "code": "82101041"
          },
          {
            "name": "Phường Hiệp Thành",
            "code": "82101042"
          }
        ]
      },
      {
        "name": "Thành phố Cà Mau",
        "code": "82301",
        "wards": [
          {
            "name": "Phường An Xuyên",
            "code": "82301001"
          },
          {
            "name": "Phường Lý Văn Lâm",
            "code": "82301002"
          },
          {
            "name": "Phường Tân Thành",
            "code": "82301003"
          },
          {
            "name": "Phường Hòa Thành",
            "code": "82301004"
          }
        ]
      },
      {
        "name": "Thị xã Giá Rai",
        "code": "82107",
        "wards": [
          {
            "name": "Phường Giá Rai",
            "code": "82107043"
          },
          {
            "name": "Phường Láng Tròn",
            "code": "82107044"
          },
          {
            "name": "Xã Phong Thạnh",
            "code": "82107045"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Cao Bằng",
    "code": "07",
    "districts": [
      {
        "name": "Huyện Bảo Lạc",
        "code": "20303",
        "wards": [
          {
            "name": "Xã Sơn Lộ",
            "code": "20303009"
          },
          {
            "name": "Xã Hưng Đạo",
            "code": "20303010"
          },
          {
            "name": "Xã Bảo Lạc",
            "code": "20303011"
          },
          {
            "name": "Xã Cốc Pàng",
            "code": "20303012"
          },
          {
            "name": "Xã Cô Ba",
            "code": "20303013"
          },
          {
            "name": "Xã Khánh Xuân",
            "code": "20303014"
          },
          {
            "name": "Xã Xuân Trường",
            "code": "20303015"
          },
          {
            "name": "Xã Huy Giáp",
            "code": "20303016"
          }
        ]
      },
      {
        "name": "Huyện Bảo Lâm",
        "code": "20323",
        "wards": [
          {
            "name": "Xã Quảng Lâm",
            "code": "20323004"
          },
          {
            "name": "Xã Nam Quang",
            "code": "20323005"
          },
          {
            "name": "Xã Lý Bôn",
            "code": "20323006"
          },
          {
            "name": "Xã Bảo Lâm",
            "code": "20323007"
          },
          {
            "name": "Xã Yên Thổ",
            "code": "20323008"
          }
        ]
      },
      {
        "name": "Huyện Hạ Lang",
        "code": "20319",
        "wards": [
          {
            "name": "Xã Lý Quốc",
            "code": "20319053"
          },
          {
            "name": "Xã Hạ Lang",
            "code": "20319054"
          },
          {
            "name": "Xã Vinh Quý",
            "code": "20319055"
          },
          {
            "name": "Xã Quang Long",
            "code": "20319056"
          }
        ]
      },
      {
        "name": "Huyện Hà Quảng",
        "code": "20305",
        "wards": [
          {
            "name": "Xã Thanh Long",
            "code": "20305024"
          },
          {
            "name": "Xã Cần Yên",
            "code": "20305025"
          },
          {
            "name": "Xã Thông Nông",
            "code": "20305026"
          },
          {
            "name": "Xã Trường Hà",
            "code": "20305027"
          },
          {
            "name": "Xã Hà Quảng",
            "code": "20305028"
          },
          {
            "name": "Xã Lũng Nặm",
            "code": "20305029"
          },
          {
            "name": "Xã Tổng Cọt",
            "code": "20305030"
          }
        ]
      },
      {
        "name": "Huyện Hoà An",
        "code": "20315",
        "wards": [
          {
            "name": "Xã Nam Tuấn",
            "code": "20315031"
          },
          {
            "name": "Xã Hoà An",
            "code": "20315032"
          },
          {
            "name": "Xã Bạch Đằng",
            "code": "20315033"
          },
          {
            "name": "Xã Nguyễn Huệ",
            "code": "20315034"
          }
        ]
      },
      {
        "name": "Huyện Nguyên Bình",
        "code": "20313",
        "wards": [
          {
            "name": "Xã Ca Thành",
            "code": "20313017"
          },
          {
            "name": "Xã Phan Thanh",
            "code": "20313018"
          },
          {
            "name": "Xã Thành Công",
            "code": "20313019"
          },
          {
            "name": "Xã Tĩnh Túc",
            "code": "20313020"
          },
          {
            "name": "Xã Tam Kim",
            "code": "20313021"
          },
          {
            "name": "Xã Nguyên Bình",
            "code": "20313022"
          },
          {
            "name": "Xã Minh Tâm",
            "code": "20313023"
          }
        ]
      },
      {
        "name": "Huyện Quảng Hòa",
        "code": "20317",
        "wards": [
          {
            "name": "Xã Phục Hoà",
            "code": "20317041"
          },
          {
            "name": "Xã Bế Văn Đàn",
            "code": "20317042"
          },
          {
            "name": "Xã Độc Lập",
            "code": "20317043"
          },
          {
            "name": "Xã Quảng Uyên",
            "code": "20317044"
          },
          {
            "name": "Xã Hạnh Phúc",
            "code": "20317045"
          }
        ]
      },
      {
        "name": "Huyện Thạch An",
        "code": "20321",
        "wards": [
          {
            "name": "Xã Minh Khai",
            "code": "20321035"
          },
          {
            "name": "Xã Canh Tân",
            "code": "20321036"
          },
          {
            "name": "Xã Kim Đồng",
            "code": "20321037"
          },
          {
            "name": "Xã Thạch An",
            "code": "20321038"
          },
          {
            "name": "Xã Đông Khê",
            "code": "20321039"
          },
          {
            "name": "Xã Đức Long",
            "code": "20321040"
          }
        ]
      },
      {
        "name": "Huyện Trùng Khánh",
        "code": "20311",
        "wards": [
          {
            "name": "Xã Quang Hán",
            "code": "20311046"
          },
          {
            "name": "Xã Trà Lĩnh",
            "code": "20311047"
          },
          {
            "name": "Xã Quang Trung",
            "code": "20311048"
          },
          {
            "name": "Xã Đoài Dương",
            "code": "20311049"
          },
          {
            "name": "Xã Trùng Khánh",
            "code": "20311050"
          },
          {
            "name": "Xã Đàm Thuỷ",
            "code": "20311051"
          },
          {
            "name": "Xã Đình Phong",
            "code": "20311052"
          }
        ]
      },
      {
        "name": "Thành phố Cao Bằng",
        "code": "20301",
        "wards": [
          {
            "name": "Phường Thục Phán",
            "code": "20301001"
          },
          {
            "name": "Phường Nùng Trí Cao",
            "code": "20301002"
          },
          {
            "name": "Phường Tân Giang",
            "code": "20301003"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Đắk Lắk",
    "code": "25",
    "districts": [
      {
        "name": "Huyện Buôn Đôn",
        "code": "60511",
        "wards": [
          {
            "name": "Xã Ea Wer",
            "code": "60511015"
          },
          {
            "name": "Xã Ea Nuôl",
            "code": "60511016"
          },
          {
            "name": "Xã Buôn Đôn",
            "code": "60511017"
          }
        ]
      },
      {
        "name": "Huyện Cư Kuin",
        "code": "60537",
        "wards": [
          {
            "name": "Xã Ea Ning",
            "code": "60537063"
          },
          {
            "name": "Xã Dray Bhăng",
            "code": "60537064"
          },
          {
            "name": "Xã Ea Ktur",
            "code": "60537065"
          }
        ]
      },
      {
        "name": "Huyện Cư M'gar",
        "code": "60513",
        "wards": [
          {
            "name": "Xã Ea Kiết",
            "code": "60513018"
          },
          {
            "name": "Xã Ea M’Droh",
            "code": "60513019"
          },
          {
            "name": "Xã Quảng Phú",
            "code": "60513020"
          },
          {
            "name": "Xã Cuôr Đăng",
            "code": "60513021"
          },
          {
            "name": "Xã Cư M’gar",
            "code": "60513022"
          },
          {
            "name": "Xã Ea Tul",
            "code": "60513023"
          }
        ]
      },
      {
        "name": "Huyện Đồng Xuân",
        "code": "50903",
        "wards": [
          {
            "name": "Xã Xuân Lãnh",
            "code": "50903099"
          },
          {
            "name": "Xã Phú Mỡ",
            "code": "50903100"
          },
          {
            "name": "Xã Xuân Phước",
            "code": "50903101"
          },
          {
            "name": "Xã Đồng Xuân",
            "code": "50903102"
          }
        ]
      },
      {
        "name": "Huyện Ea H'leo",
        "code": "60503",
        "wards": [
          {
            "name": "Xã Ea Khăl",
            "code": "60503027"
          },
          {
            "name": "Xã Ea Drăng",
            "code": "60503028"
          },
          {
            "name": "Xã Ea Wy",
            "code": "60503029"
          },
          {
            "name": "Xã Ea H’leo",
            "code": "60503030"
          },
          {
            "name": "Xã Ea Hiao",
            "code": "60503031"
          }
        ]
      },
      {
        "name": "Huyện Ea Kar",
        "code": "60515",
        "wards": [
          {
            "name": "Xã Ea Kar",
            "code": "60515042"
          },
          {
            "name": "Xã Ea Ô",
            "code": "60515043"
          },
          {
            "name": "Xã Ea Knốp",
            "code": "60515044"
          },
          {
            "name": "Xã Cư Yang",
            "code": "60515045"
          },
          {
            "name": "Xã Ea Păl",
            "code": "60515046"
          }
        ]
      },
      {
        "name": "Huyện Ea Súp",
        "code": "60505",
        "wards": [
          {
            "name": "Xã Ea Súp",
            "code": "60505010"
          },
          {
            "name": "Xã Ea Rốk",
            "code": "60505011"
          },
          {
            "name": "Xã Ea Bung",
            "code": "60505012"
          },
          {
            "name": "Xã Ia Rvê",
            "code": "60505013"
          },
          {
            "name": "Xã Ia Lốp",
            "code": "60505014"
          }
        ]
      },
      {
        "name": "Huyện Krông A Na",
        "code": "60523",
        "wards": [
          {
            "name": "Xã Krông Ana",
            "code": "60523066"
          },
          {
            "name": "Xã Dur Kmăl",
            "code": "60523067"
          },
          {
            "name": "Xã Ea Na",
            "code": "60523068"
          }
        ]
      },
      {
        "name": "Huyện Krông Bông",
        "code": "60525",
        "wards": [
          {
            "name": "Xã Hoà Sơn",
            "code": "60525053"
          },
          {
            "name": "Xã Dang Kang",
            "code": "60525054"
          },
          {
            "name": "Xã Krông Bông",
            "code": "60525055"
          },
          {
            "name": "Xã Yang Mao",
            "code": "60525056"
          },
          {
            "name": "Xã Cư Pui",
            "code": "60525057"
          }
        ]
      },
      {
        "name": "Huyện Krông Buk",
        "code": "60539",
        "wards": [
          {
            "name": "Xã Pơng Drang",
            "code": "60539024"
          },
          {
            "name": "Xã Krông Búk",
            "code": "60539025"
          },
          {
            "name": "Xã Cư Pơng",
            "code": "60539026"
          }
        ]
      },
      {
        "name": "Huyện Krông Năng",
        "code": "60507",
        "wards": [
          {
            "name": "Xã Krông Năng",
            "code": "60507032"
          },
          {
            "name": "Xã Dliê Ya",
            "code": "60507033"
          },
          {
            "name": "Xã Tam Giang",
            "code": "60507034"
          },
          {
            "name": "Xã Phú Xuân",
            "code": "60507035"
          }
        ]
      },
      {
        "name": "Huyện Krông Pắc",
        "code": "60519",
        "wards": [
          {
            "name": "Xã Krông Pắc",
            "code": "60519036"
          },
          {
            "name": "Xã Ea Knuếc",
            "code": "60519037"
          },
          {
            "name": "Xã Tân Tiến",
            "code": "60519038"
          },
          {
            "name": "Xã Ea Phê",
            "code": "60519039"
          },
          {
            "name": "Xã Ea Kly",
            "code": "60519040"
          },
          {
            "name": "Xã Vụ Bổn",
            "code": "60519041"
          }
        ]
      },
      {
        "name": "Huyện Lắk",
        "code": "60531",
        "wards": [
          {
            "name": "Xã Liên Sơn Lắk",
            "code": "60531058"
          },
          {
            "name": "Xã Đắk Liêng",
            "code": "60531059"
          },
          {
            "name": "Xã Nam Ka",
            "code": "60531060"
          },
          {
            "name": "Xã Đắk Phơi",
            "code": "60531061"
          },
          {
            "name": "Xã Krông Nô",
            "code": "60531062"
          }
        ]
      },
      {
        "name": "Huyện M'ĐrắK",
        "code": "60517",
        "wards": [
          {
            "name": "Xã M’Drắk",
            "code": "60517047"
          },
          {
            "name": "Xã Ea Riêng",
            "code": "60517048"
          },
          {
            "name": "Xã Cư M’ta",
            "code": "60517049"
          },
          {
            "name": "Xã Krông Á",
            "code": "60517050"
          },
          {
            "name": "Xã Cư Prao",
            "code": "60517051"
          },
          {
            "name": "Xã Ea Trang",
            "code": "60517052"
          }
        ]
      },
      {
        "name": "Huyện Phú Hoà",
        "code": "50915",
        "wards": [
          {
            "name": "Xã Phú Hòa 1",
            "code": "50915085"
          },
          {
            "name": "Xã Phú Hòa 2",
            "code": "50915086"
          }
        ]
      },
      {
        "name": "Huyện Sông Hinh",
        "code": "50913",
        "wards": [
          {
            "name": "Xã Ea Ly",
            "code": "50913095"
          },
          {
            "name": "Xã Ea Bá",
            "code": "50913096"
          },
          {
            "name": "Xã Đức Bình",
            "code": "50913097"
          },
          {
            "name": "Xã Sông Hinh",
            "code": "50913098"
          }
        ]
      },
      {
        "name": "Huyện Sơn Hoà",
        "code": "50909",
        "wards": [
          {
            "name": "Xã Sơn Hòa",
            "code": "50909091"
          },
          {
            "name": "Xã Vân Hòa",
            "code": "50909092"
          },
          {
            "name": "Xã Tây Sơn",
            "code": "50909093"
          },
          {
            "name": "Xã Suối Trai",
            "code": "50909094"
          }
        ]
      },
      {
        "name": "Huyện Tây Hoà",
        "code": "50912",
        "wards": [
          {
            "name": "Xã Tây Hòa",
            "code": "50912087"
          },
          {
            "name": "Xã Hòa Thịnh",
            "code": "50912088"
          },
          {
            "name": "Xã Hòa Mỹ",
            "code": "50912089"
          },
          {
            "name": "Xã Sơn Thành",
            "code": "50912090"
          }
        ]
      },
      {
        "name": "Huyện Tuy An",
        "code": "50907",
        "wards": [
          {
            "name": "Xã Tuy An Bắc",
            "code": "50907080"
          },
          {
            "name": "Xã Tuy An Đông",
            "code": "50907081"
          },
          {
            "name": "Xã Ô Loan",
            "code": "50907082"
          },
          {
            "name": "Xã Tuy An Nam",
            "code": "50907083"
          },
          {
            "name": "Xã Tuy An Tây",
            "code": "50907084"
          }
        ]
      },
      {
        "name": "Thành phố Tuy Hoà",
        "code": "50901",
        "wards": [
          {
            "name": "Phường Tuy Hòa",
            "code": "50901069"
          },
          {
            "name": "Phường Phú Yên",
            "code": "50901070"
          },
          {
            "name": "Phường Bình Kiến",
            "code": "50901071"
          }
        ]
      },
      {
        "name": "Thị xã Buôn Hồ",
        "code": "60509",
        "wards": [
          {
            "name": "Xã Ea Drông",
            "code": "60509007"
          },
          {
            "name": "Phường Buôn Hồ",
            "code": "60509008"
          },
          {
            "name": "Phường Cư Bao",
            "code": "60509009"
          }
        ]
      },
      {
        "name": "Thị xã Đông Hòa",
        "code": "50911",
        "wards": [
          {
            "name": "Xã Hòa Xuân",
            "code": "50911077"
          },
          {
            "name": "Phường Đông Hòa",
            "code": "50911078"
          },
          {
            "name": "Phường Hòa Hiệp",
            "code": "50911079"
          }
        ]
      },
      {
        "name": "Thị xã Sông Cầu",
        "code": "50905",
        "wards": [
          {
            "name": "Xã Xuân Thọ",
            "code": "50905072"
          },
          {
            "name": "Xã Xuân Cảnh",
            "code": "50905073"
          },
          {
            "name": "Xã Xuân Lộc",
            "code": "50905074"
          },
          {
            "name": "Phường Xuân Đài",
            "code": "50905075"
          },
          {
            "name": "Phường Sông Cầu",
            "code": "50905076"
          }
        ]
      },
      {
        "name": "TP.Buôn Ma Thuột",
        "code": "60501",
        "wards": [
          {
            "name": "Xã Hoà Phú",
            "code": "60501001"
          },
          {
            "name": "Phường Buôn Ma Thuột",
            "code": "60501002"
          },
          {
            "name": "Phường Tân An",
            "code": "60501003"
          },
          {
            "name": "Phường Tân Lập",
            "code": "60501004"
          },
          {
            "name": "Phường Thành Nhất",
            "code": "60501005"
          },
          {
            "name": "Phường Ea Kao",
            "code": "60501006"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Điện Biên",
    "code": "13",
    "districts": [
      {
        "name": "Huyện Điện Biên",
        "code": "30117",
        "wards": [
          {
            "name": "Xã Thanh Nưa",
            "code": "30117005"
          },
          {
            "name": "Xã Thanh An",
            "code": "30117006"
          },
          {
            "name": "Xã Thanh Yên",
            "code": "30117007"
          },
          {
            "name": "Xã Sam Mứn",
            "code": "30117008"
          },
          {
            "name": "Xã Núa Ngam",
            "code": "30117009"
          },
          {
            "name": "Xã Mường Nhà",
            "code": "30117010"
          }
        ]
      },
      {
        "name": "Huyện Điện Biên Đông",
        "code": "30119",
        "wards": [
          {
            "name": "Xã Na Son",
            "code": "30119026"
          },
          {
            "name": "Xã Xa Dung",
            "code": "30119027"
          },
          {
            "name": "Xã Pu Nhi",
            "code": "30119028"
          },
          {
            "name": "Xã Mường Luân",
            "code": "30119029"
          },
          {
            "name": "Xã Tìa Dình",
            "code": "30119030"
          },
          {
            "name": "Xã Phình Giàng",
            "code": "30119031"
          }
        ]
      },
      {
        "name": "Huyện Mường Ảng",
        "code": "30121",
        "wards": [
          {
            "name": "Xã Mường Ảng",
            "code": "30121042"
          },
          {
            "name": "Xã Nà Tấu",
            "code": "30121043"
          },
          {
            "name": "Xã Búng Lao",
            "code": "30121044"
          },
          {
            "name": "Xã Mường Lạn",
            "code": "30121045"
          }
        ]
      },
      {
        "name": "Huyện Mường Chà",
        "code": "30111",
        "wards": [
          {
            "name": "Xã Na Sang",
            "code": "30111021"
          },
          {
            "name": "Xã Mường Tùng",
            "code": "30111022"
          },
          {
            "name": "Xã Pa Ham",
            "code": "30111023"
          },
          {
            "name": "Xã Nậm Nèn",
            "code": "30111024"
          },
          {
            "name": "Xã Mường Pồn",
            "code": "30111025"
          }
        ]
      },
      {
        "name": "Huyện Mường Nhé",
        "code": "30104",
        "wards": [
          {
            "name": "Xã Mường Nhé",
            "code": "30104037"
          },
          {
            "name": "Xã Sín Thầu",
            "code": "30104038"
          },
          {
            "name": "Xã Mường Toong",
            "code": "30104039"
          },
          {
            "name": "Xã Nậm Kè",
            "code": "30104040"
          },
          {
            "name": "Xã Quảng Lâm",
            "code": "30104041"
          }
        ]
      },
      {
        "name": "Huyện Nậm Pồ",
        "code": "30123",
        "wards": [
          {
            "name": "Xã Mường Chà",
            "code": "30123032"
          },
          {
            "name": "Xã Nà Hỳ",
            "code": "30123033"
          },
          {
            "name": "Xã Nà Bủng",
            "code": "30123034"
          },
          {
            "name": "Xã Chà Tở",
            "code": "30123035"
          },
          {
            "name": "Xã Si Pa Phìn",
            "code": "30123036"
          }
        ]
      },
      {
        "name": "Huyện Tủa Chùa",
        "code": "30113",
        "wards": [
          {
            "name": "Xã Tủa Chùa",
            "code": "30113016"
          },
          {
            "name": "Xã Sín Chải",
            "code": "30113017"
          },
          {
            "name": "Xã Sính Phình",
            "code": "30113018"
          },
          {
            "name": "Xã Tủa Thàng",
            "code": "30113019"
          },
          {
            "name": "Xã Sáng Nhè",
            "code": "30113020"
          }
        ]
      },
      {
        "name": "Huyện Tuần Giáo",
        "code": "30115",
        "wards": [
          {
            "name": "Xã Tuần Giáo",
            "code": "30115011"
          },
          {
            "name": "Xã Quài Tở",
            "code": "30115012"
          },
          {
            "name": "Xã Mường Mùn",
            "code": "30115013"
          },
          {
            "name": "Xã Pú Nhung",
            "code": "30115014"
          },
          {
            "name": "Xã Chiềng Sinh",
            "code": "30115015"
          }
        ]
      },
      {
        "name": "Thị xã Mường Lay",
        "code": "30103",
        "wards": [
          {
            "name": "Phường Mường Lay",
            "code": "30103004"
          }
        ]
      },
      {
        "name": "TP.Điện Biên Phủ",
        "code": "30101",
        "wards": [
          {
            "name": "Xã Mường Phăng",
            "code": "30101001"
          },
          {
            "name": "Phường Điện Biên Phủ",
            "code": "30101002"
          },
          {
            "name": "Phường Mường Thanh",
            "code": "30101003"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Đồng Nai",
    "code": "28",
    "districts": [
      {
        "name": "Huyện Bù Đăng",
        "code": "70707",
        "wards": [
          {
            "name": "Xã Phước Sơn",
            "code": "70707083"
          },
          {
            "name": "Xã Nghĩa Trung",
            "code": "70707084"
          },
          {
            "name": "Xã Bù Đăng",
            "code": "70707085"
          },
          {
            "name": "Xã Thọ Sơn",
            "code": "70707086"
          },
          {
            "name": "Xã Đak Nhau",
            "code": "70707087"
          },
          {
            "name": "Xã Bom Bo",
            "code": "70707088"
          }
        ]
      },
      {
        "name": "Huyện Bù Đốp",
        "code": "70706",
        "wards": [
          {
            "name": "Xã Tân Tiến",
            "code": "70706066"
          },
          {
            "name": "Xã Thiện Hưng",
            "code": "70706067"
          },
          {
            "name": "Xã Hưng Phước",
            "code": "70706068"
          }
        ]
      },
      {
        "name": "Huyện Bù Gia Mập",
        "code": "70715",
        "wards": [
          {
            "name": "Xã Phú Nghĩa",
            "code": "70715069"
          },
          {
            "name": "Xã Đa Kia",
            "code": "70715070"
          },
          {
            "name": "Xã Bù Gia Mập",
            "code": "70715094"
          },
          {
            "name": "Xã Đăk Ơ",
            "code": "70715095"
          }
        ]
      },
      {
        "name": "Huyện Cẩm Mỹ",
        "code": "71311",
        "wards": [
          {
            "name": "Xã Xuân Quế",
            "code": "71311029"
          },
          {
            "name": "Xã Xuân Đường",
            "code": "71311030"
          },
          {
            "name": "Xã Cẩm Mỹ",
            "code": "71311031"
          },
          {
            "name": "Xã Sông Ray",
            "code": "71311032"
          },
          {
            "name": "Xã Xuân Đông",
            "code": "71311033"
          }
        ]
      },
      {
        "name": "Huyện Chơn Thành",
        "code": "70710",
        "wards": [
          {
            "name": "Phường Minh Hưng",
            "code": "70710051"
          },
          {
            "name": "Phường Chơn Thành",
            "code": "70710052"
          },
          {
            "name": "Xã Nha Bích",
            "code": "70710053"
          }
        ]
      },
      {
        "name": "Huyện Định Quán",
        "code": "71305",
        "wards": [
          {
            "name": "Xã Thống Nhất",
            "code": "71305023"
          },
          {
            "name": "Xã La Ngà",
            "code": "71305040"
          },
          {
            "name": "Xã Định Quán",
            "code": "71305041"
          },
          {
            "name": "Xã Phú Vinh",
            "code": "71305042"
          },
          {
            "name": "Xã Phú Hoà",
            "code": "71305043"
          },
          {
            "name": "Xã Thanh Sơn",
            "code": "71305091"
          }
        ]
      },
      {
        "name": "Huyện Đồng Phú",
        "code": "70701",
        "wards": [
          {
            "name": "Xã Thuận Lợi",
            "code": "70701079"
          },
          {
            "name": "Xã Đồng Tâm",
            "code": "70701080"
          },
          {
            "name": "Xã Tân Lợi",
            "code": "70701081"
          },
          {
            "name": "Xã Đồng Phú",
            "code": "70701082"
          }
        ]
      },
      {
        "name": "Huyện Hớn Quản",
        "code": "70713",
        "wards": [
          {
            "name": "Xã Tân Quan",
            "code": "70713054"
          },
          {
            "name": "Xã Tân Hưng",
            "code": "70713055"
          },
          {
            "name": "Xã Tân Khai",
            "code": "70713056"
          },
          {
            "name": "Xã Minh Đức",
            "code": "70713057"
          }
        ]
      },
      {
        "name": "Huyện Long Thành",
        "code": "71315",
        "wards": [
          {
            "name": "Xã Phước Thái",
            "code": "71315011"
          },
          {
            "name": "Xã Long Phước",
            "code": "71315012"
          },
          {
            "name": "Xã Bình An",
            "code": "71315013"
          },
          {
            "name": "Xã Long Thành",
            "code": "71315014"
          },
          {
            "name": "Xã An Phước",
            "code": "71315015"
          }
        ]
      },
      {
        "name": "Huyện Lộc Ninh",
        "code": "70705",
        "wards": [
          {
            "name": "Xã Lộc Thành",
            "code": "70705060"
          },
          {
            "name": "Xã Lộc Ninh",
            "code": "70705061"
          },
          {
            "name": "Xã Lộc Hưng",
            "code": "70705062"
          },
          {
            "name": "Xã Lộc Tấn",
            "code": "70705063"
          },
          {
            "name": "Xã Lộc Thạnh",
            "code": "70705064"
          },
          {
            "name": "Xã Lộc Quang",
            "code": "70705065"
          }
        ]
      },
      {
        "name": "Huyện Nhơn Trạch",
        "code": "71317",
        "wards": [
          {
            "name": "Xã Đại Phước",
            "code": "71317008"
          },
          {
            "name": "Xã Nhơn Trạch",
            "code": "71317009"
          },
          {
            "name": "Xã Phước An",
            "code": "71317010"
          }
        ]
      },
      {
        "name": "Huyện Phú Riềng",
        "code": "70716",
        "wards": [
          {
            "name": "Xã Bình Tân",
            "code": "70716073"
          },
          {
            "name": "Xã Long Hà",
            "code": "70716074"
          },
          {
            "name": "Xã Phú Riềng",
            "code": "70716075"
          },
          {
            "name": "Xã Phú Trung",
            "code": "70716076"
          }
        ]
      },
      {
        "name": "Huyện Tân Phú",
        "code": "71303",
        "wards": [
          {
            "name": "Xã Tà Lài",
            "code": "71303044"
          },
          {
            "name": "Xã Nam Cát Tiên",
            "code": "71303045"
          },
          {
            "name": "Xã Tân Phú",
            "code": "71303046"
          },
          {
            "name": "Xã Phú Lâm",
            "code": "71303047"
          },
          {
            "name": "Xã Đak Lua",
            "code": "71303092"
          }
        ]
      },
      {
        "name": "Huyện Thống Nhất",
        "code": "71309",
        "wards": [
          {
            "name": "Xã Dầu Giây",
            "code": "71309021"
          },
          {
            "name": "Xã Gia Kiệm",
            "code": "71309022"
          }
        ]
      },
      {
        "name": "Huyện Trảng Bom",
        "code": "71308",
        "wards": [
          {
            "name": "Xã An Viễn",
            "code": "71308016"
          },
          {
            "name": "Xã Bình Minh",
            "code": "71308017"
          },
          {
            "name": "Xã Trảng Bom",
            "code": "71308018"
          },
          {
            "name": "Xã Bàu Hàm",
            "code": "71308019"
          },
          {
            "name": "Xã Hưng Thịnh",
            "code": "71308020"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Cửu",
        "code": "71307",
        "wards": [
          {
            "name": "Xã Trị An",
            "code": "71307048"
          },
          {
            "name": "Xã Tân An",
            "code": "71307049"
          },
          {
            "name": "Phường Tân Triều",
            "code": "71307050"
          },
          {
            "name": "Xã Phú Lý",
            "code": "71307093"
          }
        ]
      },
      {
        "name": "Huyện Xuân Lộc",
        "code": "71313",
        "wards": [
          {
            "name": "Xã Xuân Định",
            "code": "71313034"
          },
          {
            "name": "Xã Xuân Phú",
            "code": "71313035"
          },
          {
            "name": "Xã Xuân Lộc",
            "code": "71313036"
          },
          {
            "name": "Xã Xuân Hoà",
            "code": "71313037"
          },
          {
            "name": "Xã Xuân Thành",
            "code": "71313038"
          },
          {
            "name": "Xã Xuân Bắc",
            "code": "71313039"
          }
        ]
      },
      {
        "name": "Thành phố Biên Hoà",
        "code": "71301",
        "wards": [
          {
            "name": "Phường Biên Hoà",
            "code": "71301001"
          },
          {
            "name": "Phường Trấn Biên",
            "code": "71301002"
          },
          {
            "name": "Phường Tam Hiệp",
            "code": "71301003"
          },
          {
            "name": "Phường Long Bình",
            "code": "71301004"
          },
          {
            "name": "Phường Trảng Dài",
            "code": "71301005"
          },
          {
            "name": "Phường Hố Nai",
            "code": "71301006"
          },
          {
            "name": "Phường Long Hưng",
            "code": "71301007"
          },
          {
            "name": "Phường Tam Phước",
            "code": "71301089"
          },
          {
            "name": "Phường Phước Tân",
            "code": "71301090"
          }
        ]
      },
      {
        "name": "Thành phố Đồng Xoài",
        "code": "70711",
        "wards": [
          {
            "name": "Phường Đồng Xoài",
            "code": "70711077"
          },
          {
            "name": "Phường Bình Phước",
            "code": "70711078"
          }
        ]
      },
      {
        "name": "Thành phố Long khánh",
        "code": "71302",
        "wards": [
          {
            "name": "Phường Bình Lộc",
            "code": "71302024"
          },
          {
            "name": "Phường Bảo Vinh",
            "code": "71302025"
          },
          {
            "name": "Phường Xuân Lập",
            "code": "71302026"
          },
          {
            "name": "Phường Long Khánh",
            "code": "71302027"
          },
          {
            "name": "Phường Hàng Gòn",
            "code": "71302028"
          }
        ]
      },
      {
        "name": "Thị xã Bình Long",
        "code": "70709",
        "wards": [
          {
            "name": "Phường Bình Long",
            "code": "70709058"
          },
          {
            "name": "Phường An Lộc",
            "code": "70709059"
          }
        ]
      },
      {
        "name": "Thị xã Phước Long",
        "code": "70703",
        "wards": [
          {
            "name": "Phường Phước Bình",
            "code": "70703071"
          },
          {
            "name": "Phường Phước Long",
            "code": "70703072"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Đồng Tháp",
    "code": "31",
    "districts": [
      {
        "name": "Huyện Cái Bè",
        "code": "80713",
        "wards": [
          {
            "name": "Xã Thanh Hưng",
            "code": "80713015"
          },
          {
            "name": "Xã An Hữu",
            "code": "80713016"
          },
          {
            "name": "Xã Mỹ Lợi",
            "code": "80713017"
          },
          {
            "name": "Xã Mỹ Đức Tây",
            "code": "80713018"
          },
          {
            "name": "Xã Mỹ Thiện",
            "code": "80713019"
          },
          {
            "name": "Xã Hậu Mỹ",
            "code": "80713020"
          },
          {
            "name": "Xã Hội Cư",
            "code": "80713021"
          },
          {
            "name": "Xã Cái Bè",
            "code": "80713022"
          }
        ]
      },
      {
        "name": "Huyện Cai Lậy",
        "code": "80709",
        "wards": [
          {
            "name": "Xã Bình Phú",
            "code": "80709023"
          },
          {
            "name": "Xã Hiệp Đức",
            "code": "80709024"
          },
          {
            "name": "Xã Ngũ Hiệp",
            "code": "80709025"
          },
          {
            "name": "Xã Long Tiên",
            "code": "80709026"
          },
          {
            "name": "Xã Mỹ Thành",
            "code": "80709027"
          },
          {
            "name": "Xã Thạnh Phú",
            "code": "80709028"
          }
        ]
      },
      {
        "name": "Huyện Cao Lãnh",
        "code": "80315",
        "wards": [
          {
            "name": "Xã Phong Mỹ",
            "code": "80315084"
          },
          {
            "name": "Xã Ba Sao",
            "code": "80315085"
          },
          {
            "name": "Xã Mỹ Thọ",
            "code": "80315086"
          },
          {
            "name": "Xã Bình Hàng Trung",
            "code": "80315087"
          },
          {
            "name": "Xã Mỹ Hiệp",
            "code": "80315088"
          }
        ]
      },
      {
        "name": "Huyện Châu Thành",
        "code": "80707",
        "wards": [
          {
            "name": "Xã Tân Hương",
            "code": "80707033"
          },
          {
            "name": "Xã Châu Thành",
            "code": "80707034"
          },
          {
            "name": "Xã Long Hưng",
            "code": "80707035"
          },
          {
            "name": "Xã Long Định",
            "code": "80707036"
          },
          {
            "name": "Xã Vĩnh Kim",
            "code": "80707037"
          },
          {
            "name": "Xã Kim Sơn",
            "code": "80707038"
          },
          {
            "name": "Xã Bình Trưng",
            "code": "80707039"
          },
          {
            "name": "Xã Phú Hựu",
            "code": "80321100"
          },
          {
            "name": "Xã Tân Nhuận Đông",
            "code": "80321101"
          },
          {
            "name": "Xã Tân Phú Trung",
            "code": "80321102"
          }
        ]
      },
      {
        "name": "Huyện Chợ Gạo",
        "code": "80711",
        "wards": [
          {
            "name": "Xã Mỹ Tịnh An",
            "code": "80711040"
          },
          {
            "name": "Xã Lương Hoà Lạc",
            "code": "80711041"
          },
          {
            "name": "Xã Tân Thuận Bình",
            "code": "80711042"
          },
          {
            "name": "Xã Chợ Gạo",
            "code": "80711043"
          },
          {
            "name": "Xã An Thạnh Thủy",
            "code": "80711044"
          },
          {
            "name": "Xã Bình Ninh",
            "code": "80711045"
          }
        ]
      },
      {
        "name": "Huyện Gò Công Đông",
        "code": "80717",
        "wards": [
          {
            "name": "Xã Gò Công Đông",
            "code": "80717051"
          },
          {
            "name": "Xã Tân Điền",
            "code": "80717052"
          },
          {
            "name": "Xã Tân Hoà",
            "code": "80717053"
          },
          {
            "name": "Xã Tân Đông",
            "code": "80717054"
          },
          {
            "name": "Xã Gia Thuận",
            "code": "80717055"
          }
        ]
      },
      {
        "name": "Huyện Gò Công Tây",
        "code": "80715",
        "wards": [
          {
            "name": "Xã Vĩnh Bình",
            "code": "80715046"
          },
          {
            "name": "Xã Đồng Sơn",
            "code": "80715047"
          },
          {
            "name": "Xã Phú Thành",
            "code": "80715048"
          },
          {
            "name": "Xã Long Bình",
            "code": "80715049"
          },
          {
            "name": "Xã Vĩnh Hựu",
            "code": "80715050"
          }
        ]
      },
      {
        "name": "Huyện Hồng Ngự",
        "code": "80307",
        "wards": [
          {
            "name": "Phường Thường Lạc",
            "code": "80307064"
          },
          {
            "name": "Xã Thường Phước",
            "code": "80307065"
          },
          {
            "name": "Xã Long Khánh",
            "code": "80307066"
          },
          {
            "name": "Xã Long Phú Thuận",
            "code": "80307067"
          }
        ]
      },
      {
        "name": "Huyện Lai Vung",
        "code": "80319",
        "wards": [
          {
            "name": "Xã Lai Vung",
            "code": "80319095"
          },
          {
            "name": "Xã Hoà Long",
            "code": "80319096"
          },
          {
            "name": "Xã Phong Hoà",
            "code": "80319097"
          },
          {
            "name": "Xã Tân Dương",
            "code": "80319099"
          }
        ]
      },
      {
        "name": "Huyện Lấp Vò",
        "code": "80317",
        "wards": [
          {
            "name": "Xã Mỹ An Hưng",
            "code": "80317092"
          },
          {
            "name": "Xã Tân Khánh Trung",
            "code": "80317093"
          },
          {
            "name": "Xã Lấp Vò",
            "code": "80317094"
          }
        ]
      },
      {
        "name": "Huyện Tam Nông",
        "code": "80309",
        "wards": [
          {
            "name": "Xã An Hoà",
            "code": "80309068"
          },
          {
            "name": "Xã Tam Nông",
            "code": "80309069"
          },
          {
            "name": "Xã Phú Thọ",
            "code": "80309070"
          },
          {
            "name": "Xã Tràm Chim",
            "code": "80309071"
          },
          {
            "name": "Xã Phú Cường",
            "code": "80309072"
          },
          {
            "name": "Xã An Long",
            "code": "80309073"
          }
        ]
      },
      {
        "name": "Huyện Tân Hồng",
        "code": "80305",
        "wards": [
          {
            "name": "Xã Tân Hồng",
            "code": "80305058"
          },
          {
            "name": "Xã Tân Thành",
            "code": "80305059"
          },
          {
            "name": "Xã Tân Hộ Cơ",
            "code": "80305060"
          },
          {
            "name": "Xã An Phước",
            "code": "80305061"
          }
        ]
      },
      {
        "name": "Huyện Tân Phú Đông",
        "code": "80719",
        "wards": [
          {
            "name": "Xã Tân Thới",
            "code": "80719056"
          },
          {
            "name": "Xã Tân Phú Đông",
            "code": "80719057"
          }
        ]
      },
      {
        "name": "Huyện Tân Phước",
        "code": "80705",
        "wards": [
          {
            "name": "Xã Tân Phước 1",
            "code": "80705029"
          },
          {
            "name": "Xã Tân Phước 2",
            "code": "80705030"
          },
          {
            "name": "Xã Tân Phước 3",
            "code": "80705031"
          },
          {
            "name": "Xã Hưng Thạnh",
            "code": "80705032"
          }
        ]
      },
      {
        "name": "Huyện Thanh Bình",
        "code": "80311",
        "wards": [
          {
            "name": "Xã Thanh Bình",
            "code": "80311074"
          },
          {
            "name": "Xã Tân Thạnh",
            "code": "80311075"
          },
          {
            "name": "Xã Bình Thành",
            "code": "80311076"
          },
          {
            "name": "Xã Tân Long",
            "code": "80311077"
          }
        ]
      },
      {
        "name": "Huyện Tháp Mười",
        "code": "80313",
        "wards": [
          {
            "name": "Xã Tháp Mười",
            "code": "80313078"
          },
          {
            "name": "Xã Thanh Mỹ",
            "code": "80313079"
          },
          {
            "name": "Xã Mỹ Quí",
            "code": "80313080"
          },
          {
            "name": "Xã Đốc Binh Kiều",
            "code": "80313081"
          },
          {
            "name": "Xã Trường Xuân",
            "code": "80313082"
          },
          {
            "name": "Xã Phương Thịnh",
            "code": "80313083"
          }
        ]
      },
      {
        "name": "Thành phố Cao Lãnh",
        "code": "80301",
        "wards": [
          {
            "name": "Phường Cao Lãnh",
            "code": "80301089"
          },
          {
            "name": "Phường Mỹ Ngãi",
            "code": "80301090"
          },
          {
            "name": "Phường Mỹ Trà",
            "code": "80301091"
          }
        ]
      },
      {
        "name": "Thành phố Gò Công",
        "code": "80703",
        "wards": [
          {
            "name": "Phường Gò Công",
            "code": "80703006"
          },
          {
            "name": "Phường Long Thuận",
            "code": "80703007"
          },
          {
            "name": "Phường Sơn Qui",
            "code": "80703008"
          },
          {
            "name": "Phường Bình Xuân",
            "code": "80703009"
          }
        ]
      },
      {
        "name": "Thành phố Hồng Ngự",
        "code": "80323",
        "wards": [
          {
            "name": "Phường An Bình",
            "code": "80323062"
          },
          {
            "name": "Phường Hồng Ngự",
            "code": "80323063"
          }
        ]
      },
      {
        "name": "Thành phố Mỹ Tho",
        "code": "80701",
        "wards": [
          {
            "name": "Phường Mỹ Tho",
            "code": "80701001"
          },
          {
            "name": "Phường Đạo Thạnh",
            "code": "80701002"
          },
          {
            "name": "Phường Mỹ Phong",
            "code": "80701003"
          },
          {
            "name": "Phường Thới Sơn",
            "code": "80701004"
          },
          {
            "name": "Phường Trung An",
            "code": "80701005"
          }
        ]
      },
      {
        "name": "Thành phố Sa Đéc",
        "code": "80303",
        "wards": [
          {
            "name": "Phường Sa Đéc",
            "code": "80303098"
          }
        ]
      },
      {
        "name": "Thị xã Cai Lậy",
        "code": "80721",
        "wards": [
          {
            "name": "Phường Mỹ Phước Tây",
            "code": "80721010"
          },
          {
            "name": "Phường Thanh Hoà",
            "code": "80721011"
          },
          {
            "name": "Phường Cai Lậy",
            "code": "80721012"
          },
          {
            "name": "Phường Nhị Quý",
            "code": "80721013"
          },
          {
            "name": "Xã Tân Phú",
            "code": "80721014"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Gia Lai",
    "code": "24",
    "districts": [
      {
        "name": "Huyện An Lão",
        "code": "50703",
        "wards": [
          {
            "name": "Xã An Hoà",
            "code": "50703054"
          },
          {
            "name": "Xã An Lão",
            "code": "50703055"
          },
          {
            "name": "Xã An Vinh",
            "code": "50703056"
          },
          {
            "name": "Xã An Toàn",
            "code": "50703057"
          }
        ]
      },
      {
        "name": "Huyện Chư Păh",
        "code": "60307",
        "wards": [
          {
            "name": "Xã Ia Ly",
            "code": "60307065"
          },
          {
            "name": "Xã Chư Păh",
            "code": "60307066"
          },
          {
            "name": "Xã Ia Khươl",
            "code": "60307067"
          },
          {
            "name": "Xã Ia Phí",
            "code": "60307068"
          }
        ]
      },
      {
        "name": "Huyện Chư Prông",
        "code": "60317",
        "wards": [
          {
            "name": "Xã Chư Prông",
            "code": "60317069"
          },
          {
            "name": "Xã Bàu Cạn",
            "code": "60317070"
          },
          {
            "name": "Xã Ia Boòng",
            "code": "60317071"
          },
          {
            "name": "Xã Ia Lâu",
            "code": "60317072"
          },
          {
            "name": "Xã Ia Pia",
            "code": "60317073"
          },
          {
            "name": "Xã Ia Tôr",
            "code": "60317074"
          },
          {
            "name": "Xã Ia Púch",
            "code": "60317128"
          },
          {
            "name": "Xã Ia Mơ",
            "code": "60317129"
          }
        ]
      },
      {
        "name": "Huyện Chư Pưh",
        "code": "60331",
        "wards": [
          {
            "name": "Xã Chư Pưh",
            "code": "60331079"
          },
          {
            "name": "Xã Ia Le",
            "code": "60331080"
          },
          {
            "name": "Xã Ia Hrú",
            "code": "60331081"
          }
        ]
      },
      {
        "name": "Huyện Chư Sê",
        "code": "60319",
        "wards": [
          {
            "name": "Xã Chư Sê",
            "code": "60319075"
          },
          {
            "name": "Xã Bờ Ngoong",
            "code": "60319076"
          },
          {
            "name": "Xã Ia Ko",
            "code": "60319077"
          },
          {
            "name": "Xã Albá",
            "code": "60319078"
          }
        ]
      },
      {
        "name": "Huyện Đak Đoa",
        "code": "60325",
        "wards": [
          {
            "name": "Xã Đak Đoa",
            "code": "60325111"
          },
          {
            "name": "Xã Kon Gang",
            "code": "60325112"
          },
          {
            "name": "Xã Ia Băng",
            "code": "60325113"
          },
          {
            "name": "Xã KDang",
            "code": "60325114"
          },
          {
            "name": "Xã Đak Sơmei",
            "code": "60325115"
          }
        ]
      },
      {
        "name": "Huyện ĐakPơ",
        "code": "60327",
        "wards": [
          {
            "name": "Xã Đak Pơ",
            "code": "60327085"
          },
          {
            "name": "Xã Ya Hội",
            "code": "60327086"
          }
        ]
      },
      {
        "name": "Huyện Đức Cơ",
        "code": "60315",
        "wards": [
          {
            "name": "Xã Đức Cơ",
            "code": "60315124"
          },
          {
            "name": "Xã Ia Dơk",
            "code": "60315125"
          },
          {
            "name": "Xã Ia Krêl",
            "code": "60315126"
          },
          {
            "name": "Xã Ia Pnôn",
            "code": "60315130"
          },
          {
            "name": "Xã Ia Nan",
            "code": "60315131"
          },
          {
            "name": "Xã Ia Dom",
            "code": "60315132"
          }
        ]
      },
      {
        "name": "Huyện Hoài Ân",
        "code": "50707",
        "wards": [
          {
            "name": "Xã Hoài Ân",
            "code": "50707042"
          },
          {
            "name": "Xã Ân Tường",
            "code": "50707043"
          },
          {
            "name": "Xã Kim Sơn",
            "code": "50707044"
          },
          {
            "name": "Xã Vạn Đức",
            "code": "50707045"
          },
          {
            "name": "Xã Ân Hảo",
            "code": "50707046"
          }
        ]
      },
      {
        "name": "Huyện Ia Grai",
        "code": "60309",
        "wards": [
          {
            "name": "Xã Ia Grai",
            "code": "60309121"
          },
          {
            "name": "Xã Ia Krái",
            "code": "60309122"
          },
          {
            "name": "Xã Ia Hrung",
            "code": "60309123"
          },
          {
            "name": "Xã Ia Chia",
            "code": "60309133"
          },
          {
            "name": "Xã Ia O",
            "code": "60309134"
          }
        ]
      },
      {
        "name": "Huyện IaPa",
        "code": "60320",
        "wards": [
          {
            "name": "Xã Pờ Tó",
            "code": "60320104"
          },
          {
            "name": "Xã Ia Pa",
            "code": "60320105"
          },
          {
            "name": "Xã Ia Tul",
            "code": "60320106"
          }
        ]
      },
      {
        "name": "Huyện Kbang",
        "code": "60303",
        "wards": [
          {
            "name": "Xã Kbang",
            "code": "60303087"
          },
          {
            "name": "Xã Kông Bơ La",
            "code": "60303088"
          },
          {
            "name": "Xã Tơ Tung",
            "code": "60303089"
          },
          {
            "name": "Xã Sơn Lang",
            "code": "60303090"
          },
          {
            "name": "Xã Đak Rong",
            "code": "60303091"
          },
          {
            "name": "Xã Krong",
            "code": "60303135"
          }
        ]
      },
      {
        "name": "Huyện Kông Chro",
        "code": "60313",
        "wards": [
          {
            "name": "Xã Kông Chro",
            "code": "60313092"
          },
          {
            "name": "Xã Ya Ma",
            "code": "60313093"
          },
          {
            "name": "Xã Chư Krey",
            "code": "60313094"
          },
          {
            "name": "Xã SRó",
            "code": "60313095"
          },
          {
            "name": "Xã Đăk Song",
            "code": "60313096"
          },
          {
            "name": "Xã Chơ Long",
            "code": "60313097"
          }
        ]
      },
      {
        "name": "Huyện Krông Pa",
        "code": "60323",
        "wards": [
          {
            "name": "Xã Phú Túc",
            "code": "60323107"
          },
          {
            "name": "Xã Ia Dreh",
            "code": "60323108"
          },
          {
            "name": "Xã Ia Rsai",
            "code": "60323109"
          },
          {
            "name": "Xã Uar",
            "code": "60323110"
          }
        ]
      },
      {
        "name": "Huyện Mang Yang",
        "code": "60305",
        "wards": [
          {
            "name": "Xã Mang Yang",
            "code": "60305116"
          },
          {
            "name": "Xã Lơ Pang",
            "code": "60305117"
          },
          {
            "name": "Xã Kon Chiêng",
            "code": "60305118"
          },
          {
            "name": "Xã Hra",
            "code": "60305119"
          },
          {
            "name": "Xã Ayun",
            "code": "60305120"
          }
        ]
      },
      {
        "name": "Huyện Phù Cát",
        "code": "50713",
        "wards": [
          {
            "name": "Xã Phù Cát",
            "code": "50713019"
          },
          {
            "name": "Xã Xuân An",
            "code": "50713020"
          },
          {
            "name": "Xã Ngô Mây",
            "code": "50713021"
          },
          {
            "name": "Xã Cát Tiến",
            "code": "50713022"
          },
          {
            "name": "Xã Đề Gi",
            "code": "50713023"
          },
          {
            "name": "Xã Hoà Hội",
            "code": "50713024"
          },
          {
            "name": "Xã Hội Sơn",
            "code": "50713025"
          }
        ]
      },
      {
        "name": "Huyện Phù Mỹ",
        "code": "50709",
        "wards": [
          {
            "name": "Xã Phù Mỹ",
            "code": "50709026"
          },
          {
            "name": "Xã An Lương",
            "code": "50709027"
          },
          {
            "name": "Xã Bình Dương",
            "code": "50709028"
          },
          {
            "name": "Xã Phù Mỹ Đông",
            "code": "50709029"
          },
          {
            "name": "Xã Phù Mỹ Tây",
            "code": "50709030"
          },
          {
            "name": "Xã Phù Mỹ Nam",
            "code": "50709031"
          },
          {
            "name": "Xã Phù Mỹ Bắc",
            "code": "50709032"
          }
        ]
      },
      {
        "name": "Huyện Phú Thiện",
        "code": "60329",
        "wards": [
          {
            "name": "Xã Phú Thiện",
            "code": "60329101"
          },
          {
            "name": "Xã Chư A Thai",
            "code": "60329102"
          },
          {
            "name": "Xã Ia Hiao",
            "code": "60329103"
          }
        ]
      },
      {
        "name": "Huyện Tây Sơn",
        "code": "50715",
        "wards": [
          {
            "name": "Xã Tây Sơn",
            "code": "50715037"
          },
          {
            "name": "Xã Bình Khê",
            "code": "50715038"
          },
          {
            "name": "Xã Bình Phú",
            "code": "50715039"
          },
          {
            "name": "Xã Bình Hiệp",
            "code": "50715040"
          },
          {
            "name": "Xã Bình An",
            "code": "50715041"
          }
        ]
      },
      {
        "name": "Huyện Tuy Phước",
        "code": "50719",
        "wards": [
          {
            "name": "Xã Tuy Phước",
            "code": "50719033"
          },
          {
            "name": "Xã Tuy Phước Đông",
            "code": "50719034"
          },
          {
            "name": "Xã Tuy Phước Tây",
            "code": "50719035"
          },
          {
            "name": "Xã Tuy Phước Bắc",
            "code": "50719036"
          }
        ]
      },
      {
        "name": "Huyện Vân Canh",
        "code": "50721",
        "wards": [
          {
            "name": "Xã Vân Canh",
            "code": "50721047"
          },
          {
            "name": "Xã Canh Vinh",
            "code": "50721048"
          },
          {
            "name": "Xã Canh Liên",
            "code": "50721049"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Thạnh",
        "code": "50711",
        "wards": [
          {
            "name": "Xã Vĩnh Thạnh",
            "code": "50711050"
          },
          {
            "name": "Xã Vĩnh Thịnh",
            "code": "50711051"
          },
          {
            "name": "Xã Vĩnh Quang",
            "code": "50711052"
          },
          {
            "name": "Xã Vĩnh Sơn",
            "code": "50711053"
          }
        ]
      },
      {
        "name": "Thành phố Pleiku",
        "code": "60301",
        "wards": [
          {
            "name": "Phường Pleiku",
            "code": "60301058"
          },
          {
            "name": "Phường Hội Phú",
            "code": "60301059"
          },
          {
            "name": "Phường Thống Nhất",
            "code": "60301060"
          },
          {
            "name": "Phường Diên Hồng",
            "code": "60301061"
          },
          {
            "name": "Phường An Phú",
            "code": "60301062"
          },
          {
            "name": "Xã Biển Hồ",
            "code": "60301063"
          },
          {
            "name": "Xã Gào",
            "code": "60301064"
          }
        ]
      },
      {
        "name": "Thành phố Quy Nhơn",
        "code": "50701",
        "wards": [
          {
            "name": "Phường Quy Nhơn",
            "code": "50701001"
          },
          {
            "name": "Phường Quy Nhơn Đông",
            "code": "50701002"
          },
          {
            "name": "Phường Quy Nhơn Tây",
            "code": "50701003"
          },
          {
            "name": "Phường Quy Nhơn Nam",
            "code": "50701004"
          },
          {
            "name": "Phường Quy Nhơn Bắc",
            "code": "50701005"
          },
          {
            "name": "Xã Nhơn Châu",
            "code": "50701127"
          }
        ]
      },
      {
        "name": "Thị xã An Khê",
        "code": "60311",
        "wards": [
          {
            "name": "Phường An Khê",
            "code": "60311082"
          },
          {
            "name": "Phường An Bình",
            "code": "60311083"
          },
          {
            "name": "Xã Cửu An",
            "code": "60311084"
          }
        ]
      },
      {
        "name": "Thị xã An Nhơn",
        "code": "50717",
        "wards": [
          {
            "name": "Phường Bình Định",
            "code": "50717006"
          },
          {
            "name": "Phường An Nhơn",
            "code": "50717007"
          },
          {
            "name": "Phường An Nhơn Đông",
            "code": "50717008"
          },
          {
            "name": "Phường An Nhơn Nam",
            "code": "50717009"
          },
          {
            "name": "Phường An Nhơn Bắc",
            "code": "50717010"
          },
          {
            "name": "Xã An Nhơn Tây",
            "code": "50717011"
          }
        ]
      },
      {
        "name": "Thị xã Ayun Pa",
        "code": "60321",
        "wards": [
          {
            "name": "Phường Ayun Pa",
            "code": "60321098"
          },
          {
            "name": "Xã Ia Rbol",
            "code": "60321099"
          },
          {
            "name": "Xã Ia Sao",
            "code": "60321100"
          }
        ]
      },
      {
        "name": "Thị xã Hoài Nhơn",
        "code": "50705",
        "wards": [
          {
            "name": "Phường Bồng Sơn",
            "code": "50705012"
          },
          {
            "name": "Phường Hoài Nhơn",
            "code": "50705013"
          },
          {
            "name": "Phường Tam Quan",
            "code": "50705014"
          },
          {
            "name": "Phường Hoài Nhơn Đông",
            "code": "50705015"
          },
          {
            "name": "Phường Hoài Nhơn Tây",
            "code": "50705016"
          },
          {
            "name": "Phường Hoài Nhơn Nam",
            "code": "50705017"
          },
          {
            "name": "Phường Hoài Nhơn Bắc",
            "code": "50705018"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Hà Tĩnh",
    "code": "18",
    "districts": [
      {
        "name": "Huyện Can Lộc",
        "code": "40511",
        "wards": [
          {
            "name": "Xã Can Lộc",
            "code": "40511034"
          },
          {
            "name": "Xã Tùng Lộc",
            "code": "40511035"
          },
          {
            "name": "Xã Gia Hanh",
            "code": "40511036"
          },
          {
            "name": "Xã Trường Lưu",
            "code": "40511037"
          },
          {
            "name": "Xã Xuân Lộc",
            "code": "40511038"
          },
          {
            "name": "Xã Đồng Lộc",
            "code": "40511039"
          }
        ]
      },
      {
        "name": "Huyện Cẩm Xuyên",
        "code": "40515",
        "wards": [
          {
            "name": "Xã Cẩm Xuyên",
            "code": "40515012"
          },
          {
            "name": "Xã Thiên Cầm",
            "code": "40515013"
          },
          {
            "name": "Xã Cẩm Duệ",
            "code": "40515014"
          },
          {
            "name": "Xã Cẩm Hưng",
            "code": "40515015"
          },
          {
            "name": "Xã Cẩm Lạc",
            "code": "40515016"
          },
          {
            "name": "Xã Cẩm Trung",
            "code": "40515017"
          },
          {
            "name": "Xã Yên Hoà",
            "code": "40515018"
          }
        ]
      },
      {
        "name": "Huyện Đức Thọ",
        "code": "40507",
        "wards": [
          {
            "name": "Xã Đức Thọ",
            "code": "40507046"
          },
          {
            "name": "Xã Đức Quang",
            "code": "40507047"
          },
          {
            "name": "Xã Đức Đồng",
            "code": "40507048"
          },
          {
            "name": "Xã Đức Thịnh",
            "code": "40507049"
          },
          {
            "name": "Xã Đức Minh",
            "code": "40507050"
          }
        ]
      },
      {
        "name": "Huyện Hương Khê",
        "code": "40517",
        "wards": [
          {
            "name": "Xã Hương Khê",
            "code": "40517061"
          },
          {
            "name": "Xã Hương Phố",
            "code": "40517062"
          },
          {
            "name": "Xã Hương Đô",
            "code": "40517063"
          },
          {
            "name": "Xã Hà Linh",
            "code": "40517064"
          },
          {
            "name": "Xã Hương Bình",
            "code": "40517065"
          },
          {
            "name": "Xã Phúc Trạch",
            "code": "40517066"
          },
          {
            "name": "Xã Hương Xuân",
            "code": "40517067"
          }
        ]
      },
      {
        "name": "Huyện Hương Sơn",
        "code": "40509",
        "wards": [
          {
            "name": "Xã Hương Sơn",
            "code": "40509051"
          },
          {
            "name": "Xã Sơn Tây",
            "code": "40509052"
          },
          {
            "name": "Xã Tứ Mỹ",
            "code": "40509053"
          },
          {
            "name": "Xã Sơn Giang",
            "code": "40509054"
          },
          {
            "name": "Xã Sơn Tiến",
            "code": "40509055"
          },
          {
            "name": "Xã Sơn Hồng",
            "code": "40509056"
          },
          {
            "name": "Xã Kim Hoa",
            "code": "40509057"
          },
          {
            "name": "Xã Sơn Kim 1",
            "code": "40509068"
          },
          {
            "name": "Xã Sơn Kim 2",
            "code": "40509069"
          }
        ]
      },
      {
        "name": "Huyện Kỳ Anh",
        "code": "40519",
        "wards": [
          {
            "name": "Xã Kỳ Xuân",
            "code": "40519005"
          },
          {
            "name": "Xã Kỳ Anh",
            "code": "40519006"
          },
          {
            "name": "Xã Kỳ Hoa",
            "code": "40519007"
          },
          {
            "name": "Xã Kỳ Văn",
            "code": "40519008"
          },
          {
            "name": "Xã Kỳ Khang",
            "code": "40519009"
          },
          {
            "name": "Xã Kỳ Lạc",
            "code": "40519010"
          },
          {
            "name": "Xã Kỳ Thượng",
            "code": "40519011"
          }
        ]
      },
      {
        "name": "Huyện Nghi Xuân",
        "code": "40505",
        "wards": [
          {
            "name": "Xã Tiên Điền",
            "code": "40505042"
          },
          {
            "name": "Xã Nghi Xuân",
            "code": "40505043"
          },
          {
            "name": "Xã Cổ Đạm",
            "code": "40505044"
          },
          {
            "name": "Xã Đan Hải",
            "code": "40505045"
          }
        ]
      },
      {
        "name": "Huyện Thạch Hà",
        "code": "40513",
        "wards": [
          {
            "name": "Xã Thạch Hà",
            "code": "40513026"
          },
          {
            "name": "Xã Toàn Lưu",
            "code": "40513027"
          },
          {
            "name": "Xã Việt Xuyên",
            "code": "40513028"
          },
          {
            "name": "Xã Đông Kinh",
            "code": "40513029"
          },
          {
            "name": "Xã Thạch Xuân",
            "code": "40513030"
          },
          {
            "name": "Xã Lộc Hà",
            "code": "40513031"
          },
          {
            "name": "Xã Hồng Lộc",
            "code": "40513032"
          },
          {
            "name": "Xã Mai Phụ",
            "code": "40513033"
          }
        ]
      },
      {
        "name": "Huyện Vũ Quang",
        "code": "40521",
        "wards": [
          {
            "name": "Xã Vũ Quang",
            "code": "40521058"
          },
          {
            "name": "Xã Mai Hoa",
            "code": "40521059"
          },
          {
            "name": "Xã Thượng Đức",
            "code": "40521060"
          }
        ]
      },
      {
        "name": "Thành phố Hà Tĩnh",
        "code": "40501",
        "wards": [
          {
            "name": "Phường Thành Sen",
            "code": "40501019"
          },
          {
            "name": "Phường Trần Phú",
            "code": "40501020"
          },
          {
            "name": "Phường Hà Huy Tập",
            "code": "40501021"
          },
          {
            "name": "Xã Thạch Lạc",
            "code": "40501022"
          },
          {
            "name": "Xã Đồng Tiến",
            "code": "40501023"
          },
          {
            "name": "Xã Thạch Khê",
            "code": "40501024"
          },
          {
            "name": "Xã Cẩm Bình",
            "code": "40501025"
          }
        ]
      },
      {
        "name": "Thị xã Hồng Lĩnh",
        "code": "40503",
        "wards": [
          {
            "name": "Phường Bắc Hồng Lĩnh",
            "code": "40503040"
          },
          {
            "name": "Phường Nam Hồng Lĩnh",
            "code": "40503041"
          }
        ]
      },
      {
        "name": "Thị xã Kỳ Anh",
        "code": "40520",
        "wards": [
          {
            "name": "Phường Sông Trí",
            "code": "40520001"
          },
          {
            "name": "Phường Hải Ninh",
            "code": "40520002"
          },
          {
            "name": "Phường Hoành Sơn",
            "code": "40520003"
          },
          {
            "name": "Phường Vũng Áng",
            "code": "40520004"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Hưng Yên",
    "code": "05",
    "districts": [
      {
        "name": "Huyện Ân Thi",
        "code": "10907",
        "wards": [
          {
            "name": "Xã Ân Thi",
            "code": "10907019"
          },
          {
            "name": "Xã Xuân Trúc",
            "code": "10907020"
          },
          {
            "name": "Xã Phạm Ngũ Lão",
            "code": "10907021"
          },
          {
            "name": "Xã Nguyễn Trãi",
            "code": "10907022"
          },
          {
            "name": "Xã Hồng Quang",
            "code": "10907023"
          }
        ]
      },
      {
        "name": "Huyện Đông Hưng",
        "code": "11509",
        "wards": [
          {
            "name": "Xã Đông Hưng",
            "code": "11509081"
          },
          {
            "name": "Xã Bắc Tiên Hưng",
            "code": "11509082"
          },
          {
            "name": "Xã Đông Tiên Hưng",
            "code": "11509083"
          },
          {
            "name": "Xã Nam Đông Hưng",
            "code": "11509084"
          },
          {
            "name": "Xã Bắc Đông Quan",
            "code": "11509085"
          },
          {
            "name": "Xã Bắc Đông Hưng",
            "code": "11509086"
          },
          {
            "name": "Xã Đông Quan",
            "code": "11509087"
          },
          {
            "name": "Xã Nam Tiên Hưng",
            "code": "11509088"
          },
          {
            "name": "Xã Tiên Hưng",
            "code": "11509089"
          }
        ]
      },
      {
        "name": "Huyện Hưng Hà",
        "code": "11505",
        "wards": [
          {
            "name": "Xã Hưng Hà",
            "code": "11505073"
          },
          {
            "name": "Xã Tiên La",
            "code": "11505074"
          },
          {
            "name": "Xã Lê Quý Đôn",
            "code": "11505075"
          },
          {
            "name": "Xã Hồng Minh",
            "code": "11505076"
          },
          {
            "name": "Xã Thần Khê",
            "code": "11505077"
          },
          {
            "name": "Xã Diên Hà",
            "code": "11505078"
          },
          {
            "name": "Xã Ngự Thiên",
            "code": "11505079"
          },
          {
            "name": "Xã Long Hưng",
            "code": "11505080"
          }
        ]
      },
      {
        "name": "Huyện Khoái Châu",
        "code": "10905",
        "wards": [
          {
            "name": "Xã Khoái Châu",
            "code": "10905024"
          },
          {
            "name": "Xã Triệu Việt Vương",
            "code": "10905025"
          },
          {
            "name": "Xã Việt Tiến",
            "code": "10905026"
          },
          {
            "name": "Xã Chí Minh",
            "code": "10905027"
          },
          {
            "name": "Xã Châu Ninh",
            "code": "10905028"
          }
        ]
      },
      {
        "name": "Huyện Kiến Xương",
        "code": "11513",
        "wards": [
          {
            "name": "Xã Lê Lợi",
            "code": "11513090"
          },
          {
            "name": "Xã Kiến Xương",
            "code": "11513091"
          },
          {
            "name": "Xã Quang Lịch",
            "code": "11513092"
          },
          {
            "name": "Xã Vũ Quý",
            "code": "11513093"
          },
          {
            "name": "Xã Bình Thanh",
            "code": "11513094"
          },
          {
            "name": "Xã Bình Định",
            "code": "11513095"
          },
          {
            "name": "Xã Hồng Vũ",
            "code": "11513096"
          },
          {
            "name": "Xã Bình Nguyên",
            "code": "11513097"
          },
          {
            "name": "Xã Trà Giang",
            "code": "11513098"
          }
        ]
      },
      {
        "name": "Huyện Kim Động",
        "code": "10909",
        "wards": [
          {
            "name": "Xã Lương Bằng",
            "code": "10909015"
          },
          {
            "name": "Xã Nghĩa Dân",
            "code": "10909016"
          },
          {
            "name": "Xã Hiệp Cường",
            "code": "10909017"
          },
          {
            "name": "Xã Đức Hợp",
            "code": "10909018"
          }
        ]
      },
      {
        "name": "Huyện Phù Cừ",
        "code": "10911",
        "wards": [
          {
            "name": "Xã Quang Hưng",
            "code": "10911011"
          },
          {
            "name": "Xã Đoàn Đào",
            "code": "10911012"
          },
          {
            "name": "Xã Tiên Tiến",
            "code": "10911013"
          },
          {
            "name": "Xã Tống Trân",
            "code": "10911014"
          }
        ]
      },
      {
        "name": "Huyện Quỳnh Phụ",
        "code": "11503",
        "wards": [
          {
            "name": "Xã Quỳnh Phụ",
            "code": "11503064"
          },
          {
            "name": "Xã Minh Thọ",
            "code": "11503065"
          },
          {
            "name": "Xã Nguyễn Du",
            "code": "11503066"
          },
          {
            "name": "Xã Quỳnh An",
            "code": "11503067"
          },
          {
            "name": "Xã Ngọc Lâm",
            "code": "11503068"
          },
          {
            "name": "Xã Đồng Bằng",
            "code": "11503069"
          },
          {
            "name": "Xã A Sào",
            "code": "11503070"
          },
          {
            "name": "Xã Phụ Dực",
            "code": "11503071"
          },
          {
            "name": "Xã Tân Tiến",
            "code": "11503072"
          }
        ]
      },
      {
        "name": "Huyện Thái Thụy",
        "code": "11507",
        "wards": [
          {
            "name": "Xã Thái Thụy",
            "code": "11507045"
          },
          {
            "name": "Xã Đông Thụy Anh",
            "code": "11507046"
          },
          {
            "name": "Xã Bắc Thụy Anh",
            "code": "11507047"
          },
          {
            "name": "Xã Thụy Anh",
            "code": "11507048"
          },
          {
            "name": "Xã Nam Thụy Anh",
            "code": "11507049"
          },
          {
            "name": "Xã Bắc Thái Ninh",
            "code": "11507050"
          },
          {
            "name": "Xã Thái Ninh",
            "code": "11507051"
          },
          {
            "name": "Xã Đông Thái Ninh",
            "code": "11507052"
          },
          {
            "name": "Xã Nam Thái Ninh",
            "code": "11507053"
          },
          {
            "name": "Xã Tây Thái Ninh",
            "code": "11507054"
          },
          {
            "name": "Xã Tây Thụy Anh",
            "code": "11507055"
          }
        ]
      },
      {
        "name": "Huyện Tiền Hải",
        "code": "11515",
        "wards": [
          {
            "name": "Xã Tiền Hải",
            "code": "11515056"
          },
          {
            "name": "Xã Tây Tiền Hải",
            "code": "11515057"
          },
          {
            "name": "Xã Ái Quốc",
            "code": "11515058"
          },
          {
            "name": "Xã Đồng Châu",
            "code": "11515059"
          },
          {
            "name": "Xã Đông Tiền Hải",
            "code": "11515060"
          },
          {
            "name": "Xã Nam Cường",
            "code": "11515061"
          },
          {
            "name": "Xã Hưng Phú",
            "code": "11515062"
          },
          {
            "name": "Xã Nam Tiền Hải",
            "code": "11515063"
          }
        ]
      },
      {
        "name": "Huyện Tiên Lữ",
        "code": "10913",
        "wards": [
          {
            "name": "Xã Hoàng Hoa Thám",
            "code": "10913008"
          },
          {
            "name": "Xã Tiên Lữ",
            "code": "10913009"
          },
          {
            "name": "Xã Tiên Hoa",
            "code": "10913010"
          }
        ]
      },
      {
        "name": "Huyện Văn Giang",
        "code": "10915",
        "wards": [
          {
            "name": "Xã Nghĩa Trụ",
            "code": "10915036"
          },
          {
            "name": "Xã Phụng Công",
            "code": "10915037"
          },
          {
            "name": "Xã Văn Giang",
            "code": "10915038"
          },
          {
            "name": "Xã Mễ Sở",
            "code": "10915039"
          }
        ]
      },
      {
        "name": "Huyện Văn Lâm",
        "code": "10917",
        "wards": [
          {
            "name": "Xã Như Quỳnh",
            "code": "10917033"
          },
          {
            "name": "Xã Lạc Đạo",
            "code": "10917034"
          },
          {
            "name": "Xã Đại Đồng",
            "code": "10917035"
          }
        ]
      },
      {
        "name": "Huyện Vũ Thư",
        "code": "11511",
        "wards": [
          {
            "name": "Xã Vũ Thư",
            "code": "11511099"
          },
          {
            "name": "Xã Thư Trì",
            "code": "11511100"
          },
          {
            "name": "Xã Tân Thuận",
            "code": "11511101"
          },
          {
            "name": "Xã Thư Vũ",
            "code": "11511102"
          },
          {
            "name": "Xã Vũ Tiên",
            "code": "11511103"
          },
          {
            "name": "Xã Vạn Xuân",
            "code": "11511104"
          }
        ]
      },
      {
        "name": "Huyện Yên Mỹ",
        "code": "10919",
        "wards": [
          {
            "name": "Xã Yên Mỹ",
            "code": "10919029"
          },
          {
            "name": "Xã Việt Yên",
            "code": "10919030"
          },
          {
            "name": "Xã Hoàn Long",
            "code": "10919031"
          },
          {
            "name": "Xã Nguyễn Văn Linh",
            "code": "10919032"
          }
        ]
      },
      {
        "name": "Thành phố Hưng Yên",
        "code": "10901",
        "wards": [
          {
            "name": "Phường Phố Hiến",
            "code": "10901001"
          },
          {
            "name": "Phường Sơn Nam",
            "code": "10901002"
          },
          {
            "name": "Phường Hồng Châu",
            "code": "10901003"
          },
          {
            "name": "Xã Tân Hưng",
            "code": "10901007"
          }
        ]
      },
      {
        "name": "Thành phố Thái Bình",
        "code": "11501",
        "wards": [
          {
            "name": "Phường Thái Bình",
            "code": "11501040"
          },
          {
            "name": "Phường Trần Lãm",
            "code": "11501041"
          },
          {
            "name": "Phường Trần Hưng Đạo",
            "code": "11501042"
          },
          {
            "name": "Phường Trà Lý",
            "code": "11501043"
          },
          {
            "name": "Phường Vũ Phúc",
            "code": "11501044"
          }
        ]
      },
      {
        "name": "Thị xã Mỹ Hào",
        "code": "10903",
        "wards": [
          {
            "name": "Phường Mỹ Hào",
            "code": "10903004"
          },
          {
            "name": "Phường Đường Hào",
            "code": "10903005"
          },
          {
            "name": "Phường Thượng Hồng",
            "code": "10903006"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Khánh Hòa",
    "code": "23",
    "districts": [
      {
        "name": "Huyện Bác Ái",
        "code": "70509",
        "wards": [
          {
            "name": "Xã Bác Ái Đông",
            "code": "70509063"
          },
          {
            "name": "Xã Bác Ái",
            "code": "70509064"
          },
          {
            "name": "Xã Bác Ái Tây",
            "code": "70509065"
          }
        ]
      },
      {
        "name": "Huyện Cam Lâm",
        "code": "51117",
        "wards": [
          {
            "name": "Xã Cam Lâm",
            "code": "51117029"
          },
          {
            "name": "Xã Suối Dầu",
            "code": "51117030"
          },
          {
            "name": "Xã Cam Hiệp",
            "code": "51117031"
          },
          {
            "name": "Xã Cam An",
            "code": "51117032"
          }
        ]
      },
      {
        "name": "Huyện Diên Khánh",
        "code": "51107",
        "wards": [
          {
            "name": "Xã Diên Khánh",
            "code": "51107023"
          },
          {
            "name": "Xã Diên Lạc",
            "code": "51107024"
          },
          {
            "name": "Xã Diên Điền",
            "code": "51107025"
          },
          {
            "name": "Xã Diên Lâm",
            "code": "51107026"
          },
          {
            "name": "Xã Diên Thọ",
            "code": "51107027"
          },
          {
            "name": "Xã Suối Hiệp",
            "code": "51107028"
          }
        ]
      },
      {
        "name": "Huyện Khánh Sơn",
        "code": "51113",
        "wards": [
          {
            "name": "Xã Khánh Sơn",
            "code": "51113038"
          },
          {
            "name": "Xã Tây Khánh Sơn",
            "code": "51113039"
          },
          {
            "name": "Xã Đông Khánh Sơn",
            "code": "51113040"
          }
        ]
      },
      {
        "name": "Huyện Khánh Vĩnh",
        "code": "51111",
        "wards": [
          {
            "name": "Xã Bắc Khánh Vĩnh",
            "code": "51111033"
          },
          {
            "name": "Xã Trung Khánh Vĩnh",
            "code": "51111034"
          },
          {
            "name": "Xã Tây Khánh Vĩnh",
            "code": "51111035"
          },
          {
            "name": "Xã Nam Khánh Vĩnh",
            "code": "51111036"
          },
          {
            "name": "Xã Khánh Vĩnh",
            "code": "51111037"
          }
        ]
      },
      {
        "name": "Huyện Ninh Hải",
        "code": "70505",
        "wards": [
          {
            "name": "Phường Ninh Chử",
            "code": "70505044"
          },
          {
            "name": "Xã Ninh Hải",
            "code": "70505054"
          },
          {
            "name": "Xã Xuân Hải",
            "code": "70505055"
          },
          {
            "name": "Xã Vĩnh Hải",
            "code": "70505056"
          }
        ]
      },
      {
        "name": "Huyện Ninh Phước",
        "code": "70507",
        "wards": [
          {
            "name": "Xã Ninh Phước",
            "code": "70507047"
          },
          {
            "name": "Xã Phước Hữu",
            "code": "70507048"
          },
          {
            "name": "Xã Phước Hậu",
            "code": "70507049"
          }
        ]
      },
      {
        "name": "Huyện Ninh Sơn",
        "code": "70503",
        "wards": [
          {
            "name": "Xã Ninh Sơn",
            "code": "70503059"
          },
          {
            "name": "Xã Lâm Sơn",
            "code": "70503060"
          },
          {
            "name": "Xã Anh Dũng",
            "code": "70503061"
          },
          {
            "name": "Xã Mỹ Sơn",
            "code": "70503062"
          }
        ]
      },
      {
        "name": "Huyện Thuận Bắc",
        "code": "70511",
        "wards": [
          {
            "name": "Xã Thuận Bắc",
            "code": "70511057"
          },
          {
            "name": "Xã Công Hải",
            "code": "70511058"
          }
        ]
      },
      {
        "name": "Huyện Thuận Nam",
        "code": "70513",
        "wards": [
          {
            "name": "Xã Thuận Nam",
            "code": "70513050"
          },
          {
            "name": "Xã Cà Ná",
            "code": "70513051"
          },
          {
            "name": "Xã Phước Hà",
            "code": "70513052"
          },
          {
            "name": "Xã Phước Dinh",
            "code": "70513053"
          }
        ]
      },
      {
        "name": "Huyện Trường Sa",
        "code": "51115",
        "wards": [
          {
            "name": "Đặc khu Trường Sa",
            "code": "51115041"
          }
        ]
      },
      {
        "name": "Huyện Vạn Ninh",
        "code": "51103",
        "wards": [
          {
            "name": "Xã Đại Lãnh",
            "code": "51103018"
          },
          {
            "name": "Xã Tu Bông",
            "code": "51103019"
          },
          {
            "name": "Xã Vạn Thắng",
            "code": "51103020"
          },
          {
            "name": "Xã Vạn Ninh",
            "code": "51103021"
          },
          {
            "name": "Xã Vạn Hưng",
            "code": "51103022"
          }
        ]
      },
      {
        "name": "Thành phố Cam Ranh",
        "code": "51109",
        "wards": [
          {
            "name": "Phường Bắc Cam Ranh",
            "code": "51109005"
          },
          {
            "name": "Phường Cam Ranh",
            "code": "51109006"
          },
          {
            "name": "Phường Cam Linh",
            "code": "51109007"
          },
          {
            "name": "Phường Ba Ngòi",
            "code": "51109008"
          },
          {
            "name": "Xã Nam Cam Ranh",
            "code": "51109009"
          }
        ]
      },
      {
        "name": "Thành phố Nha Trang",
        "code": "51101",
        "wards": [
          {
            "name": "Phường Nha Trang",
            "code": "51101001"
          },
          {
            "name": "Phường Bắc Nha Trang",
            "code": "51101002"
          },
          {
            "name": "Phường Tây Nha Trang",
            "code": "51101003"
          },
          {
            "name": "Phường Nam Nha Trang",
            "code": "51101004"
          }
        ]
      },
      {
        "name": "Thị xã Ninh Hoà",
        "code": "51105",
        "wards": [
          {
            "name": "Xã Bắc Ninh Hoà",
            "code": "51105010"
          },
          {
            "name": "Phường Ninh Hoà",
            "code": "51105011"
          },
          {
            "name": "Xã Tân Định",
            "code": "51105012"
          },
          {
            "name": "Phường Đông Ninh Hoà",
            "code": "51105013"
          },
          {
            "name": "Phường Hoà Thắng",
            "code": "51105014"
          },
          {
            "name": "Xã Nam Ninh Hoà",
            "code": "51105015"
          },
          {
            "name": "Xã Tây Ninh Hoà",
            "code": "51105016"
          },
          {
            "name": "Xã Hoà Trí",
            "code": "51105017"
          }
        ]
      },
      {
        "name": "TP.Phan Rang-Tháp Chàm",
        "code": "70501",
        "wards": [
          {
            "name": "Phường Phan Rang",
            "code": "70501042"
          },
          {
            "name": "Phường Đông Hải",
            "code": "70501043"
          },
          {
            "name": "Phường Bảo An",
            "code": "70501045"
          },
          {
            "name": "Phường Đô Vinh",
            "code": "70501046"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Lai Châu",
    "code": "14",
    "districts": [
      {
        "name": "Huyện Mường Tè",
        "code": "30201",
        "wards": [
          {
            "name": "Xã Bum Nưa",
            "code": "30201032"
          },
          {
            "name": "Xã Bum Tở",
            "code": "30201033"
          },
          {
            "name": "Xã Mường Tè",
            "code": "30201034"
          },
          {
            "name": "Xã Thu Lũm",
            "code": "30201035"
          },
          {
            "name": "Xã Pa Ủ",
            "code": "30201036"
          },
          {
            "name": "Xã Tà Tổng",
            "code": "30201037"
          },
          {
            "name": "Xã Mù Cả",
            "code": "30201038"
          }
        ]
      },
      {
        "name": "Huyện Nậm Nhùn",
        "code": "30213",
        "wards": [
          {
            "name": "Xã Lê Lợi",
            "code": "30213027"
          },
          {
            "name": "Xã Nậm Hàng",
            "code": "30213028"
          },
          {
            "name": "Xã Mường Mô",
            "code": "30213029"
          },
          {
            "name": "Xã Hua Bum",
            "code": "30213030"
          },
          {
            "name": "Xã Pa Tần",
            "code": "30213031"
          }
        ]
      },
      {
        "name": "Huyện Phong Thổ",
        "code": "30203",
        "wards": [
          {
            "name": "Xã Sin Suối Hồ",
            "code": "30203015"
          },
          {
            "name": "Xã Phong Thổ",
            "code": "30203016"
          },
          {
            "name": "Xã Sì Lở Lầu",
            "code": "30203017"
          },
          {
            "name": "Xã Dào San",
            "code": "30203018"
          },
          {
            "name": "Xã Khổng Lào",
            "code": "30203019"
          }
        ]
      },
      {
        "name": "Huyện Sìn Hồ",
        "code": "30207",
        "wards": [
          {
            "name": "Xã Tủa Sín Chải",
            "code": "30207020"
          },
          {
            "name": "Xã Sìn Hồ",
            "code": "30207021"
          },
          {
            "name": "Xã Hồng Thu",
            "code": "30207022"
          },
          {
            "name": "Xã Nậm Tăm",
            "code": "30207023"
          },
          {
            "name": "Xã Pu Sam Cáp",
            "code": "30207024"
          },
          {
            "name": "Xã Nậm Cuổi",
            "code": "30207025"
          },
          {
            "name": "Xã Nậm Mạ",
            "code": "30207026"
          }
        ]
      },
      {
        "name": "Huyện Tam Đường",
        "code": "30205",
        "wards": [
          {
            "name": "Xã Bản Bo",
            "code": "30205009"
          },
          {
            "name": "Xã Bình Lư",
            "code": "30205010"
          },
          {
            "name": "Xã Tả Lèng",
            "code": "30205011"
          },
          {
            "name": "Xã Khun Há",
            "code": "30205012"
          }
        ]
      },
      {
        "name": "Huyện Tân Uyên",
        "code": "30211",
        "wards": [
          {
            "name": "Xã Pắc Ta",
            "code": "30211005"
          },
          {
            "name": "Xã Nậm Sỏ",
            "code": "30211006"
          },
          {
            "name": "Xã Tân Uyên",
            "code": "30211007"
          },
          {
            "name": "Xã Mường Khoa",
            "code": "30211008"
          }
        ]
      },
      {
        "name": "Huyện Than Uyên",
        "code": "30209",
        "wards": [
          {
            "name": "Xã Mường Kim",
            "code": "30209001"
          },
          {
            "name": "Xã Khoen On",
            "code": "30209002"
          },
          {
            "name": "Xã Than Uyên",
            "code": "30209003"
          },
          {
            "name": "Xã Mường Than",
            "code": "30209004"
          }
        ]
      },
      {
        "name": "Thành phố Lai Châu",
        "code": "30202",
        "wards": [
          {
            "name": "Phường Tân Phong",
            "code": "30202013"
          },
          {
            "name": "Phường Đoàn Kết",
            "code": "30202014"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Lạng Sơn",
    "code": "11",
    "districts": [
      {
        "name": "Huyện Bắc Sơn",
        "code": "20909",
        "wards": [
          {
            "name": "Xã Bắc Sơn",
            "code": "20909016"
          },
          {
            "name": "Xã Hưng Vũ",
            "code": "20909017"
          },
          {
            "name": "Xã Vũ Lăng",
            "code": "20909018"
          },
          {
            "name": "Xã Nhất Hoà",
            "code": "20909019"
          },
          {
            "name": "Xã Vũ Lễ",
            "code": "20909020"
          },
          {
            "name": "Xã Tân Tri",
            "code": "20909021"
          }
        ]
      },
      {
        "name": "Huyện Bình Gia",
        "code": "20907",
        "wards": [
          {
            "name": "Xã Bình Gia",
            "code": "20907008"
          },
          {
            "name": "Xã Tân Văn",
            "code": "20907009"
          },
          {
            "name": "Xã Hồng Phong",
            "code": "20907010"
          },
          {
            "name": "Xã Hoa Thám",
            "code": "20907011"
          },
          {
            "name": "Xã Quý Hoà",
            "code": "20907012"
          },
          {
            "name": "Xã Thiện Hoà",
            "code": "20907013"
          },
          {
            "name": "Xã Thiện Thuật",
            "code": "20907014"
          },
          {
            "name": "Xã Thiện Long",
            "code": "20907015"
          }
        ]
      },
      {
        "name": "Huyện Cao Lộc",
        "code": "20913",
        "wards": [
          {
            "name": "Xã Khánh Khê",
            "code": "20913027"
          },
          {
            "name": "Xã Đồng Đăng",
            "code": "20913058"
          },
          {
            "name": "Xã Cao Lộc",
            "code": "20913059"
          },
          {
            "name": "Xã Công Sơn",
            "code": "20913060"
          },
          {
            "name": "Xã Ba Sơn",
            "code": "20913061"
          },
          {
            "name": "Phường Kỳ Lừa",
            "code": "20913064"
          }
        ]
      },
      {
        "name": "Huyện Chi Lăng",
        "code": "20917",
        "wards": [
          {
            "name": "Xã Chi Lăng",
            "code": "20917052"
          },
          {
            "name": "Xã Nhân Lý",
            "code": "20917053"
          },
          {
            "name": "Xã Chiến Thắng",
            "code": "20917054"
          },
          {
            "name": "Xã Quan Sơn",
            "code": "20917055"
          },
          {
            "name": "Xã Bằng Mạc",
            "code": "20917056"
          },
          {
            "name": "Xã Vạn Linh",
            "code": "20917057"
          }
        ]
      },
      {
        "name": "Huyện Đình Lập",
        "code": "20919",
        "wards": [
          {
            "name": "Xã Đình Lập",
            "code": "20919040"
          },
          {
            "name": "Xã Châu Sơn",
            "code": "20919041"
          },
          {
            "name": "Xã Kiên Mộc",
            "code": "20919042"
          },
          {
            "name": "Xã Thái Bình",
            "code": "20919043"
          }
        ]
      },
      {
        "name": "Huyện Hữu Lũng",
        "code": "20921",
        "wards": [
          {
            "name": "Xã Hữu Lũng",
            "code": "20921044"
          },
          {
            "name": "Xã Tuấn Sơn",
            "code": "20921045"
          },
          {
            "name": "Xã Tân Thành",
            "code": "20921046"
          },
          {
            "name": "Xã Vân Nham",
            "code": "20921047"
          },
          {
            "name": "Xã Thiện Tân",
            "code": "20921048"
          },
          {
            "name": "Xã Yên Bình",
            "code": "20921049"
          },
          {
            "name": "Xã Hữu Liên",
            "code": "20921050"
          },
          {
            "name": "Xã Cai Kinh",
            "code": "20921051"
          }
        ]
      },
      {
        "name": "Huyện Lộc Bình",
        "code": "20915",
        "wards": [
          {
            "name": "Xã Lộc Bình",
            "code": "20915033"
          },
          {
            "name": "Xã Mẫu Sơn",
            "code": "20915034"
          },
          {
            "name": "Xã Na Dương",
            "code": "20915035"
          },
          {
            "name": "Xã Lợi Bác",
            "code": "20915036"
          },
          {
            "name": "Xã Thống Nhất",
            "code": "20915037"
          },
          {
            "name": "Xã Xuân Dương",
            "code": "20915038"
          },
          {
            "name": "Xã Khuất Xá",
            "code": "20915039"
          }
        ]
      },
      {
        "name": "Huyện Tràng Định",
        "code": "20903",
        "wards": [
          {
            "name": "Xã Thất Khê",
            "code": "20903001"
          },
          {
            "name": "Xã Đoàn Kết",
            "code": "20903002"
          },
          {
            "name": "Xã Tân Tiến",
            "code": "20903003"
          },
          {
            "name": "Xã Tràng Định",
            "code": "20903004"
          },
          {
            "name": "Xã Quốc Khánh",
            "code": "20903005"
          },
          {
            "name": "Xã Kháng Chiến",
            "code": "20903006"
          },
          {
            "name": "Xã Quốc Việt",
            "code": "20903007"
          }
        ]
      },
      {
        "name": "Huyện Văn Lãng",
        "code": "20905",
        "wards": [
          {
            "name": "Xã Na Sầm",
            "code": "20905028"
          },
          {
            "name": "Xã Văn Lãng",
            "code": "20905029"
          },
          {
            "name": "Xã Hội Hoan",
            "code": "20905030"
          },
          {
            "name": "Xã Thụy Hùng",
            "code": "20905031"
          },
          {
            "name": "Xã Hoàng Văn Thụ",
            "code": "20905032"
          }
        ]
      },
      {
        "name": "Huyện Văn Quan",
        "code": "20911",
        "wards": [
          {
            "name": "Xã Văn Quan",
            "code": "20911022"
          },
          {
            "name": "Xã Điềm He",
            "code": "20911023"
          },
          {
            "name": "Xã Tri Lễ",
            "code": "20911024"
          },
          {
            "name": "Xã Yên Phúc",
            "code": "20911025"
          },
          {
            "name": "Xã Tân Đoàn",
            "code": "20911026"
          }
        ]
      },
      {
        "name": "Thành phố Lạng Sơn",
        "code": "20901",
        "wards": [
          {
            "name": "Phường Tam Thanh",
            "code": "20901062"
          },
          {
            "name": "Phường Lương Văn Tri",
            "code": "20901063"
          },
          {
            "name": "Phường Đông Kinh",
            "code": "20901065"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Lào Cai",
    "code": "09",
    "districts": [
      {
        "name": "Huyện Bảo Thắng",
        "code": "20511",
        "wards": [
          {
            "name": "Xã Phong Hải",
            "code": "20511046"
          },
          {
            "name": "Xã Xuân Quang",
            "code": "20511047"
          },
          {
            "name": "Xã Bảo Thắng",
            "code": "20511048"
          },
          {
            "name": "Xã Tằng Lỏong",
            "code": "20511049"
          },
          {
            "name": "Xã Gia Phú",
            "code": "20511050"
          }
        ]
      },
      {
        "name": "Huyện Bảo Yên",
        "code": "20515",
        "wards": [
          {
            "name": "Xã Nghĩa Đô",
            "code": "20515062"
          },
          {
            "name": "Xã Thượng Hà",
            "code": "20515063"
          },
          {
            "name": "Xã Bảo Yên",
            "code": "20515064"
          },
          {
            "name": "Xã Xuân Hoà",
            "code": "20515065"
          },
          {
            "name": "Xã Phúc Khánh",
            "code": "20515066"
          },
          {
            "name": "Xã Bảo Hà",
            "code": "20515067"
          }
        ]
      },
      {
        "name": "Huyện Bát Xát",
        "code": "20507",
        "wards": [
          {
            "name": "Xã Mường Hum",
            "code": "20507055"
          },
          {
            "name": "Xã Dền Sáng",
            "code": "20507056"
          },
          {
            "name": "Xã Y Tý",
            "code": "20507057"
          },
          {
            "name": "Xã A Mú Sung",
            "code": "20507058"
          },
          {
            "name": "Xã Trịnh Tường",
            "code": "20507059"
          },
          {
            "name": "Xã Bản Xèo",
            "code": "20507060"
          },
          {
            "name": "Xã Bát Xát",
            "code": "20507061"
          }
        ]
      },
      {
        "name": "Huyện Bắc Hà",
        "code": "20509",
        "wards": [
          {
            "name": "Xã Cốc Lầu",
            "code": "20509080"
          },
          {
            "name": "Xã Bảo Nhai",
            "code": "20509081"
          },
          {
            "name": "Xã Bản Liền",
            "code": "20509082"
          },
          {
            "name": "Xã Bắc Hà",
            "code": "20509083"
          },
          {
            "name": "Xã Tả Củ Tỷ",
            "code": "20509084"
          },
          {
            "name": "Xã Lùng Phình",
            "code": "20509085"
          }
        ]
      },
      {
        "name": "Huyện Lục Yên",
        "code": "21305",
        "wards": [
          {
            "name": "Xã Lâm Thượng",
            "code": "21305026"
          },
          {
            "name": "Xã Lục Yên",
            "code": "21305027"
          },
          {
            "name": "Xã Tân Lĩnh",
            "code": "21305028"
          },
          {
            "name": "Xã Khánh Hoà",
            "code": "21305029"
          },
          {
            "name": "Xã Phúc Lợi",
            "code": "21305030"
          },
          {
            "name": "Xã Mường Lai",
            "code": "21305031"
          }
        ]
      },
      {
        "name": "Huyện Mù Cang Chải",
        "code": "21309",
        "wards": [
          {
            "name": "Xã Khao Mang",
            "code": "21309001"
          },
          {
            "name": "Xã Mù Cang Chải",
            "code": "21309002"
          },
          {
            "name": "Xã Púng Luông",
            "code": "21309003"
          },
          {
            "name": "Xã Lao Chải",
            "code": "21309092"
          },
          {
            "name": "Xã Chế Tạo",
            "code": "21309093"
          },
          {
            "name": "Xã Nậm Có",
            "code": "21309094"
          }
        ]
      },
      {
        "name": "Huyện Mường Khương",
        "code": "20505",
        "wards": [
          {
            "name": "Xã Pha Long",
            "code": "20505086"
          },
          {
            "name": "Xã Mường Khương",
            "code": "20505087"
          },
          {
            "name": "Xã Bản Lầu",
            "code": "20505088"
          },
          {
            "name": "Xã Cao Sơn",
            "code": "20505089"
          }
        ]
      },
      {
        "name": "Huyện Si Ma Cai",
        "code": "20521",
        "wards": [
          {
            "name": "Xã Si Ma Cai",
            "code": "20521090"
          },
          {
            "name": "Xã Sín Chéng",
            "code": "20521091"
          }
        ]
      },
      {
        "name": "Huyện Trạm Tấu",
        "code": "21317",
        "wards": [
          {
            "name": "Xã Trạm Tấu",
            "code": "21317005"
          },
          {
            "name": "Xã Hạnh Phúc",
            "code": "21317006"
          },
          {
            "name": "Xã Phình Hồ",
            "code": "21317007"
          },
          {
            "name": "Xã Tà Xi Láng",
            "code": "21317095"
          }
        ]
      },
      {
        "name": "Huyện Trấn Yên",
        "code": "21311",
        "wards": [
          {
            "name": "Xã Trấn Yên",
            "code": "21311041"
          },
          {
            "name": "Xã Hưng Khánh",
            "code": "21311042"
          },
          {
            "name": "Xã Lương Thịnh",
            "code": "21311043"
          },
          {
            "name": "Xã Việt Hồng",
            "code": "21311044"
          },
          {
            "name": "Xã Quy Mông",
            "code": "21311045"
          }
        ]
      },
      {
        "name": "Huyện Văn Bàn",
        "code": "20519",
        "wards": [
          {
            "name": "Xã Võ Lao",
            "code": "20519068"
          },
          {
            "name": "Xã Khánh Yên",
            "code": "20519069"
          },
          {
            "name": "Xã Văn Bàn",
            "code": "20519070"
          },
          {
            "name": "Xã Dương Quỳ",
            "code": "20519071"
          },
          {
            "name": "Xã Chiềng Ken",
            "code": "20519072"
          },
          {
            "name": "Xã Minh Lương",
            "code": "20519073"
          },
          {
            "name": "Xã Nậm Chày",
            "code": "20519074"
          },
          {
            "name": "Xã Nậm Xé",
            "code": "20519098"
          }
        ]
      },
      {
        "name": "Huyện Văn Chấn",
        "code": "21315",
        "wards": [
          {
            "name": "Xã Tú Lệ",
            "code": "21315004"
          },
          {
            "name": "Xã Gia Hội",
            "code": "21315012"
          },
          {
            "name": "Xã Sơn Lương",
            "code": "21315013"
          },
          {
            "name": "Xã Thượng Bằng La",
            "code": "21315014"
          },
          {
            "name": "Xã Chấn Thịnh",
            "code": "21315015"
          },
          {
            "name": "Xã Nghĩa Tâm",
            "code": "21315016"
          },
          {
            "name": "Xã Văn Chấn",
            "code": "21315017"
          },
          {
            "name": "Xã Cát Thịnh",
            "code": "21315097"
          }
        ]
      },
      {
        "name": "Huyện Văn Yên",
        "code": "21307",
        "wards": [
          {
            "name": "Xã Phong Dụ Hạ",
            "code": "21307018"
          },
          {
            "name": "Xã Châu Quế",
            "code": "21307019"
          },
          {
            "name": "Xã Lâm Giang",
            "code": "21307020"
          },
          {
            "name": "Xã Đông Cuông",
            "code": "21307021"
          },
          {
            "name": "Xã Tân Hợp",
            "code": "21307022"
          },
          {
            "name": "Xã Mậu A",
            "code": "21307023"
          },
          {
            "name": "Xã Xuân Ái",
            "code": "21307024"
          },
          {
            "name": "Xã Mỏ Vàng",
            "code": "21307025"
          },
          {
            "name": "Xã Phong Dụ Thượng",
            "code": "21307096"
          }
        ]
      },
      {
        "name": "Huyện Yên Bình",
        "code": "21313",
        "wards": [
          {
            "name": "Xã Cảm Nhân",
            "code": "21313032"
          },
          {
            "name": "Xã Yên Thành",
            "code": "21313033"
          },
          {
            "name": "Xã Thác Bà",
            "code": "21313034"
          },
          {
            "name": "Xã Yên Bình",
            "code": "21313035"
          },
          {
            "name": "Xã Bảo Ái",
            "code": "21313036"
          }
        ]
      },
      {
        "name": "Thành phố Lào Cai",
        "code": "20501",
        "wards": [
          {
            "name": "Xã Cốc San",
            "code": "20501051"
          },
          {
            "name": "Xã Hợp Thành",
            "code": "20501052"
          },
          {
            "name": "Phường Cam Đường",
            "code": "20501053"
          },
          {
            "name": "Phường Lào Cai",
            "code": "20501054"
          }
        ]
      },
      {
        "name": "Thành phố Yên Bái",
        "code": "21301",
        "wards": [
          {
            "name": "Phường Văn Phú",
            "code": "21301037"
          },
          {
            "name": "Phường Yên Bái",
            "code": "21301038"
          },
          {
            "name": "Phường Nam Cường",
            "code": "21301039"
          },
          {
            "name": "Phường Âu Lâu",
            "code": "21301040"
          }
        ]
      },
      {
        "name": "Thị xã Nghĩa Lộ",
        "code": "21303",
        "wards": [
          {
            "name": "Phường Nghĩa Lộ",
            "code": "21303008"
          },
          {
            "name": "Phường Trung Tâm",
            "code": "21303009"
          },
          {
            "name": "Phường Cầu Thia",
            "code": "21303010"
          },
          {
            "name": "Xã Liên Sơn",
            "code": "21303011"
          }
        ]
      },
      {
        "name": "Thị xã Sa Pa",
        "code": "20513",
        "wards": [
          {
            "name": "Xã Mường Bo",
            "code": "20513075"
          },
          {
            "name": "Xã Bản Hồ",
            "code": "20513076"
          },
          {
            "name": "Xã Tả Phìn",
            "code": "20513077"
          },
          {
            "name": "Xã Tả Van",
            "code": "20513078"
          },
          {
            "name": "Phường Sa Pa",
            "code": "20513079"
          },
          {
            "name": "Xã Ngũ Chỉ Sơn",
            "code": "20513099"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Lâm Đồng",
    "code": "26",
    "districts": [
      {
        "name": "Huyện Bảo Lâm",
        "code": "70313",
        "wards": [
          {
            "name": "Xã Bảo Lâm 1",
            "code": "70313037"
          },
          {
            "name": "Xã Bảo Lâm 2",
            "code": "70313038"
          },
          {
            "name": "Xã Bảo Lâm 3",
            "code": "70313039"
          },
          {
            "name": "Xã Bảo Lâm 4",
            "code": "70313040"
          },
          {
            "name": "Xã Bảo Lâm 5",
            "code": "70313041"
          }
        ]
      },
      {
        "name": "Huyện Bắc Bình",
        "code": "71505",
        "wards": [
          {
            "name": "Xã Bắc Bình",
            "code": "71505065"
          },
          {
            "name": "Xã Hồng Thái",
            "code": "71505066"
          },
          {
            "name": "Xã Hải Ninh",
            "code": "71505067"
          },
          {
            "name": "Xã Phan Sơn",
            "code": "71505068"
          },
          {
            "name": "Xã Sông Lũy",
            "code": "71505069"
          },
          {
            "name": "Xã Lương Sơn",
            "code": "71505070"
          },
          {
            "name": "Xã Hoà Thắng",
            "code": "71505071"
          }
        ]
      },
      {
        "name": "Huyện Cư Jút",
        "code": "60603",
        "wards": [
          {
            "name": "Xã Đắk Wil",
            "code": "60603099"
          },
          {
            "name": "Xã Nam Dong",
            "code": "60603100"
          },
          {
            "name": "Xã Cư Jút",
            "code": "60603101"
          }
        ]
      },
      {
        "name": "Huyện Di Linh",
        "code": "70315",
        "wards": [
          {
            "name": "Xã Di Linh",
            "code": "70315030"
          },
          {
            "name": "Xã Hoà Ninh",
            "code": "70315031"
          },
          {
            "name": "Xã Hoà Bắc",
            "code": "70315032"
          },
          {
            "name": "Xã Đinh Trang Thượng",
            "code": "70315033"
          },
          {
            "name": "Xã Bảo Thuận",
            "code": "70315034"
          },
          {
            "name": "Xã Sơn Điền",
            "code": "70315035"
          },
          {
            "name": "Xã Gia Hiệp",
            "code": "70315036"
          }
        ]
      },
      {
        "name": "Huyện Đạ Huoai",
        "code": "70317",
        "wards": [
          {
            "name": "Xã Đạ Huoai",
            "code": "70317042"
          },
          {
            "name": "Xã Đạ Huoai 2",
            "code": "70317043"
          },
          {
            "name": "Xã Đạ Huoai 3",
            "code": "70317044"
          },
          {
            "name": "Xã Đạ Tẻh",
            "code": "70317045"
          },
          {
            "name": "Xã Đạ Tẻh 2",
            "code": "70317046"
          },
          {
            "name": "Xã Đạ Tẻh 3",
            "code": "70317047"
          },
          {
            "name": "Xã Cát Tiên",
            "code": "70317048"
          },
          {
            "name": "Xã Cát Tiên 2",
            "code": "70317049"
          },
          {
            "name": "Xã Cát Tiên 3",
            "code": "70317050"
          }
        ]
      },
      {
        "name": "Huyện Đam Rông",
        "code": "70323",
        "wards": [
          {
            "name": "Xã Đam Rông 1",
            "code": "70323026"
          },
          {
            "name": "Xã Đam Rông 2",
            "code": "70323027"
          },
          {
            "name": "Xã Đam Rông 3",
            "code": "70323028"
          },
          {
            "name": "Xã Đam Rông 4",
            "code": "70323029"
          }
        ]
      },
      {
        "name": "Huyện Đắk Glong",
        "code": "60615",
        "wards": [
          {
            "name": "Xã Tà Đùng",
            "code": "60615114"
          },
          {
            "name": "Xã Quảng Khê",
            "code": "60615115"
          },
          {
            "name": "Xã Quảng Hoà",
            "code": "60615122"
          },
          {
            "name": "Xã Quảng Sơn",
            "code": "60615123"
          }
        ]
      },
      {
        "name": "Huyện Đắk Mil",
        "code": "60607",
        "wards": [
          {
            "name": "Xã Thuận An",
            "code": "60607102"
          },
          {
            "name": "Xã Đức Lập",
            "code": "60607103"
          },
          {
            "name": "Xã Đắk Mil",
            "code": "60607104"
          },
          {
            "name": "Xã Đắk Sắk",
            "code": "60607105"
          }
        ]
      },
      {
        "name": "Huyện Đắk R'Lấp",
        "code": "60611",
        "wards": [
          {
            "name": "Xã Kiến Đức",
            "code": "60611118"
          },
          {
            "name": "Xã Nhân Cơ",
            "code": "60611119"
          },
          {
            "name": "Xã Quảng Tín",
            "code": "60611120"
          }
        ]
      },
      {
        "name": "Huyện Đắk Song",
        "code": "60609",
        "wards": [
          {
            "name": "Xã Đắk song",
            "code": "60609110"
          },
          {
            "name": "Xã Đức An",
            "code": "60609111"
          },
          {
            "name": "Xã Thuận Hạnh",
            "code": "60609112"
          },
          {
            "name": "Xã Trường Xuân",
            "code": "60609113"
          }
        ]
      },
      {
        "name": "Huyện Đơn Dương",
        "code": "70307",
        "wards": [
          {
            "name": "Xã Đơn Dương",
            "code": "70307011"
          },
          {
            "name": "Xã Ka Đô",
            "code": "70307012"
          },
          {
            "name": "Xã Quảng Lập",
            "code": "70307013"
          },
          {
            "name": "Xã D'Ran",
            "code": "70307014"
          }
        ]
      },
      {
        "name": "Huyện Đức Linh",
        "code": "71515",
        "wards": [
          {
            "name": "Xã Nam Thành",
            "code": "71515091"
          },
          {
            "name": "Xã Đức Linh",
            "code": "71515092"
          },
          {
            "name": "Xã Hoài Đức",
            "code": "71515093"
          },
          {
            "name": "Xã Trà Tân",
            "code": "71515094"
          }
        ]
      },
      {
        "name": "Huyện Đức Trọng",
        "code": "70309",
        "wards": [
          {
            "name": "Xã Hiệp Thạnh",
            "code": "70309015"
          },
          {
            "name": "Xã Đức Trọng",
            "code": "70309016"
          },
          {
            "name": "Xã Tân Hội",
            "code": "70309017"
          },
          {
            "name": "Xã Tà Hine",
            "code": "70309018"
          },
          {
            "name": "Xã Tà Năng",
            "code": "70309019"
          },
          {
            "name": "Xã Ninh Gia",
            "code": "70309121"
          }
        ]
      },
      {
        "name": "Huyện Hàm Tân",
        "code": "71514",
        "wards": [
          {
            "name": "Xã Tân Minh",
            "code": "71514083"
          },
          {
            "name": "Xã Hàm Tân",
            "code": "71514084"
          },
          {
            "name": "Xã Sơn Mỹ",
            "code": "71514085"
          }
        ]
      },
      {
        "name": "Huyện Hàm Thuận Bắc",
        "code": "71507",
        "wards": [
          {
            "name": "Xã Đông Giang",
            "code": "71507072"
          },
          {
            "name": "Xã La Dạ",
            "code": "71507073"
          },
          {
            "name": "Xã Hàm Thuận Bắc",
            "code": "71507074"
          },
          {
            "name": "Xã Hàm Thuận",
            "code": "71507075"
          },
          {
            "name": "Xã Hồng Sơn",
            "code": "71507076"
          },
          {
            "name": "Xã Hàm Liêm",
            "code": "71507077"
          }
        ]
      },
      {
        "name": "Huyện Hàm Thuận Nam",
        "code": "71509",
        "wards": [
          {
            "name": "Xã Hàm Thạnh",
            "code": "71509078"
          },
          {
            "name": "Xã Hàm Kiệm",
            "code": "71509079"
          },
          {
            "name": "Xã Tân Thành",
            "code": "71509080"
          },
          {
            "name": "Xã Hàm Thuận Nam",
            "code": "71509081"
          },
          {
            "name": "Xã Tân Lập",
            "code": "71509082"
          }
        ]
      },
      {
        "name": "Huyện Krông Nô",
        "code": "60605",
        "wards": [
          {
            "name": "Xã Nam Đà",
            "code": "60605106"
          },
          {
            "name": "Xã Krông Nô",
            "code": "60605107"
          },
          {
            "name": "Xã Nâm Nung",
            "code": "60605108"
          },
          {
            "name": "Xã Quảng Phú",
            "code": "60605109"
          }
        ]
      },
      {
        "name": "Huyện Lạc Dương",
        "code": "70305",
        "wards": [
          {
            "name": "Phường Langbiang - Đà Lạt",
            "code": "70305005"
          },
          {
            "name": "Xã Lạc Dương",
            "code": "70305010"
          }
        ]
      },
      {
        "name": "Huyện Lâm Hà",
        "code": "70311",
        "wards": [
          {
            "name": "Xã Đinh Văn - Lâm Hà",
            "code": "70311020"
          },
          {
            "name": "Xã Phú Sơn - Lâm Hà",
            "code": "70311021"
          },
          {
            "name": "Xã Nam Hà - Lâm Hà",
            "code": "70311022"
          },
          {
            "name": "Xã Nam Ban - Lâm Hà",
            "code": "70311023"
          },
          {
            "name": "Xã Tân Hà - Lâm Hà",
            "code": "70311024"
          },
          {
            "name": "Xã Phúc Thọ - Lâm Hà",
            "code": "70311025"
          }
        ]
      },
      {
        "name": "Huyện Phú Quý",
        "code": "71517",
        "wards": [
          {
            "name": "Đặc khu Phú Quý",
            "code": "71517095"
          }
        ]
      },
      {
        "name": "Huyện Tánh Linh",
        "code": "71511",
        "wards": [
          {
            "name": "Xã Bắc Ruộng",
            "code": "71511086"
          },
          {
            "name": "Xã Nghị Đức",
            "code": "71511087"
          },
          {
            "name": "Xã Đồng Kho",
            "code": "71511088"
          },
          {
            "name": "Xã Tánh Linh",
            "code": "71511089"
          },
          {
            "name": "Xã Suối Kiết",
            "code": "71511090"
          }
        ]
      },
      {
        "name": "Huyện Tuy Đức",
        "code": "60617",
        "wards": [
          {
            "name": "Xã Quảng Tân",
            "code": "60617116"
          },
          {
            "name": "Xã Tuy Đức",
            "code": "60617117"
          },
          {
            "name": "Xã Quảng Trực",
            "code": "60617124"
          }
        ]
      },
      {
        "name": "Huyện Tuy Phong",
        "code": "71503",
        "wards": [
          {
            "name": "Xã Vĩnh Hảo",
            "code": "71503061"
          },
          {
            "name": "Xã Liên Hương",
            "code": "71503062"
          },
          {
            "name": "Xã Tuy Phong",
            "code": "71503063"
          },
          {
            "name": "Xã Phan Rí Cửa",
            "code": "71503064"
          }
        ]
      },
      {
        "name": "Thành phố Bảo Lộc",
        "code": "70303",
        "wards": [
          {
            "name": "Phường 1 Bảo Lộc",
            "code": "70303006"
          },
          {
            "name": "Phường 2 Bảo Lộc",
            "code": "70303007"
          },
          {
            "name": "Phường 3 Bảo Lộc",
            "code": "70303008"
          },
          {
            "name": "Phường B' Lao",
            "code": "70303009"
          }
        ]
      },
      {
        "name": "Thành phố Đà Lạt",
        "code": "70301",
        "wards": [
          {
            "name": "Phường Xuân Hương - Đà Lạt",
            "code": "70301001"
          },
          {
            "name": "Phường Cam Ly - Đà Lạt",
            "code": "70301002"
          },
          {
            "name": "Phường Lâm Viên - Đà Lạt",
            "code": "70301003"
          },
          {
            "name": "Phường Xuân Trường - Đà Lạt",
            "code": "70301004"
          }
        ]
      },
      {
        "name": "Thành phố Gia Nghĩa",
        "code": "60613",
        "wards": [
          {
            "name": "Phường Bắc Gia Nghĩa",
            "code": "60613096"
          },
          {
            "name": "Phường Nam Gia Nghĩa",
            "code": "60613097"
          },
          {
            "name": "Phường Đông Gia Nghĩa",
            "code": "60613098"
          }
        ]
      },
      {
        "name": "Thành phố Phan Thiết",
        "code": "71501",
        "wards": [
          {
            "name": "Phường Hàm Thắng",
            "code": "71501051"
          },
          {
            "name": "Phường Bình Thuận",
            "code": "71501052"
          },
          {
            "name": "Phường Mũi Né",
            "code": "71501053"
          },
          {
            "name": "Phường Phú Thuỷ",
            "code": "71501054"
          },
          {
            "name": "Phường Phan Thiết",
            "code": "71501055"
          },
          {
            "name": "Phường Tiến Thành",
            "code": "71501056"
          },
          {
            "name": "Xã Tuyên Quang",
            "code": "71501059"
          }
        ]
      },
      {
        "name": "Thị xã La Gi",
        "code": "71513",
        "wards": [
          {
            "name": "Phường La Gi",
            "code": "71513057"
          },
          {
            "name": "Phường Phước Hội",
            "code": "71513058"
          },
          {
            "name": "Xã Tân Hải",
            "code": "71513060"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Nghệ An",
    "code": "17",
    "districts": [
      {
        "name": "Huyện Anh Sơn",
        "code": "40327",
        "wards": [
          {
            "name": "Xã Anh Sơn",
            "code": "40327001"
          },
          {
            "name": "Xã Yên Xuân",
            "code": "40327002"
          },
          {
            "name": "Xã Nhân Hoà",
            "code": "40327003"
          },
          {
            "name": "Xã Anh Sơn Đông",
            "code": "40327004"
          },
          {
            "name": "Xã Vĩnh Tường",
            "code": "40327005"
          },
          {
            "name": "Xã Thành Bình Thọ",
            "code": "40327006"
          }
        ]
      },
      {
        "name": "Huyện Con Cuông",
        "code": "40321",
        "wards": [
          {
            "name": "Xã Con Cuông",
            "code": "40321007"
          },
          {
            "name": "Xã Môn Sơn",
            "code": "40321008"
          },
          {
            "name": "Xã Mậu Thạch",
            "code": "40321009"
          },
          {
            "name": "Xã Cam Phục",
            "code": "40321010"
          },
          {
            "name": "Xã Châu Khê",
            "code": "40321011"
          },
          {
            "name": "Xã Bình Chuẩn",
            "code": "40321012"
          }
        ]
      },
      {
        "name": "Huyện Diễn Châu",
        "code": "40325",
        "wards": [
          {
            "name": "Xã Diễn Châu",
            "code": "40325013"
          },
          {
            "name": "Xã Đức Châu",
            "code": "40325014"
          },
          {
            "name": "Xã Quảng Châu",
            "code": "40325015"
          },
          {
            "name": "Xã Hải Châu",
            "code": "40325016"
          },
          {
            "name": "Xã Tân Châu",
            "code": "40325017"
          },
          {
            "name": "Xã An Châu",
            "code": "40325018"
          },
          {
            "name": "Xã Minh Châu",
            "code": "40325019"
          },
          {
            "name": "Xã Hùng Châu",
            "code": "40325020"
          }
        ]
      },
      {
        "name": "Huyện Đô Lương",
        "code": "40329",
        "wards": [
          {
            "name": "Xã Đô Lương",
            "code": "40329021"
          },
          {
            "name": "Xã Bạch Ngọc",
            "code": "40329022"
          },
          {
            "name": "Xã Văn Hiến",
            "code": "40329023"
          },
          {
            "name": "Xã Bạch Hà",
            "code": "40329024"
          },
          {
            "name": "Xã Thuần Trung",
            "code": "40329025"
          },
          {
            "name": "Xã Lương Sơn",
            "code": "40329026"
          }
        ]
      },
      {
        "name": "Huyện Hưng Nguyên",
        "code": "40337",
        "wards": [
          {
            "name": "Xã Hưng Nguyên",
            "code": "40337030"
          },
          {
            "name": "Xã Yên Trung",
            "code": "40337031"
          },
          {
            "name": "Xã Hưng Nguyên Nam",
            "code": "40337032"
          },
          {
            "name": "Xã Lam Thành",
            "code": "40337033"
          }
        ]
      },
      {
        "name": "Huyện Kỳ Sơn",
        "code": "40309",
        "wards": [
          {
            "name": "Xã Mường Xén",
            "code": "40309034"
          },
          {
            "name": "Xã Hữu Kiệm",
            "code": "40309035"
          },
          {
            "name": "Xã Nậm Cắn",
            "code": "40309036"
          },
          {
            "name": "Xã Chiêu Lưu",
            "code": "40309037"
          },
          {
            "name": "Xã Na Loi",
            "code": "40309038"
          },
          {
            "name": "Xã Mường Típ",
            "code": "40309039"
          },
          {
            "name": "Xã Na Ngoi",
            "code": "40309040"
          },
          {
            "name": "Xã Mỹ Lý",
            "code": "40309041"
          },
          {
            "name": "Xã Bắc Lý",
            "code": "40309042"
          },
          {
            "name": "Xã Keng Đu",
            "code": "40309043"
          },
          {
            "name": "Xã Huồi Tụ",
            "code": "40309044"
          },
          {
            "name": "Xã Mường Lống",
            "code": "40309045"
          }
        ]
      },
      {
        "name": "Huyện Nam Đàn",
        "code": "40335",
        "wards": [
          {
            "name": "Xã Vạn An",
            "code": "40335046"
          },
          {
            "name": "Xã Nam Đàn",
            "code": "40335047"
          },
          {
            "name": "Xã Đại Huệ",
            "code": "40335048"
          },
          {
            "name": "Xã Thiên Nhẫn",
            "code": "40335049"
          },
          {
            "name": "Xã Kim Liên",
            "code": "40335050"
          }
        ]
      },
      {
        "name": "Huyện Nghi Lộc",
        "code": "40333",
        "wards": [
          {
            "name": "Xã Nghi Lộc",
            "code": "40333058"
          },
          {
            "name": "Xã Phúc Lộc",
            "code": "40333059"
          },
          {
            "name": "Xã Đông Lộc",
            "code": "40333060"
          },
          {
            "name": "Xã Trung Lộc",
            "code": "40333061"
          },
          {
            "name": "Xã Thần Lĩnh",
            "code": "40333062"
          },
          {
            "name": "Xã Hải Lộc",
            "code": "40333063"
          },
          {
            "name": "Xã Văn Kiều",
            "code": "40333064"
          }
        ]
      },
      {
        "name": "Huyện Nghĩa Đàn",
        "code": "40313",
        "wards": [
          {
            "name": "Xã Nghĩa Đàn",
            "code": "40313051"
          },
          {
            "name": "Xã Nghĩa Thọ",
            "code": "40313052"
          },
          {
            "name": "Xã Nghĩa Lâm",
            "code": "40313053"
          },
          {
            "name": "Xã Nghĩa Mai",
            "code": "40313054"
          },
          {
            "name": "Xã Nghĩa Hưng",
            "code": "40313055"
          },
          {
            "name": "Xã Nghĩa Khánh",
            "code": "40313056"
          },
          {
            "name": "Xã Nghĩa Lộc",
            "code": "40313057"
          }
        ]
      },
      {
        "name": "Huyện Quế Phong",
        "code": "40305",
        "wards": [
          {
            "name": "Xã Quế Phong",
            "code": "40305065"
          },
          {
            "name": "Xã Tiền Phong",
            "code": "40305066"
          },
          {
            "name": "Xã Tri Lễ",
            "code": "40305067"
          },
          {
            "name": "Xã Mường Quàng",
            "code": "40305068"
          },
          {
            "name": "Xã Thông Thụ",
            "code": "40305069"
          }
        ]
      },
      {
        "name": "Huyện Quỳ Châu",
        "code": "40307",
        "wards": [
          {
            "name": "Xã Quỳ Châu",
            "code": "40307070"
          },
          {
            "name": "Xã Châu Tiến",
            "code": "40307071"
          },
          {
            "name": "Xã Hùng Chân",
            "code": "40307072"
          },
          {
            "name": "Xã Châu Bình",
            "code": "40307073"
          }
        ]
      },
      {
        "name": "Huyện Quỳ Hợp",
        "code": "40311",
        "wards": [
          {
            "name": "Xã Quỳ Hợp",
            "code": "40311074"
          },
          {
            "name": "Xã Tam Hợp",
            "code": "40311075"
          },
          {
            "name": "Xã Châu Lộc",
            "code": "40311076"
          },
          {
            "name": "Xã Châu Hồng",
            "code": "40311077"
          },
          {
            "name": "Xã Mường Ham",
            "code": "40311078"
          },
          {
            "name": "Xã Mường Chọng",
            "code": "40311079"
          },
          {
            "name": "Xã Minh Hợp",
            "code": "40311080"
          }
        ]
      },
      {
        "name": "Huyện Quỳnh Lưu",
        "code": "40317",
        "wards": [
          {
            "name": "Xã Quỳnh Lưu",
            "code": "40317081"
          },
          {
            "name": "Xã Quỳnh Văn",
            "code": "40317082"
          },
          {
            "name": "Xã Quỳnh Anh",
            "code": "40317083"
          },
          {
            "name": "Xã Quỳnh Tam",
            "code": "40317084"
          },
          {
            "name": "Xã Quỳnh Phú",
            "code": "40317085"
          },
          {
            "name": "Xã Quỳnh Sơn",
            "code": "40317086"
          },
          {
            "name": "Xã Quỳnh Thắng",
            "code": "40317087"
          }
        ]
      },
      {
        "name": "Huyện Tân Kỳ",
        "code": "40319",
        "wards": [
          {
            "name": "Xã Tân Kỳ",
            "code": "40319088"
          },
          {
            "name": "Xã Tân Phú",
            "code": "40319089"
          },
          {
            "name": "Xã Tân An",
            "code": "40319090"
          },
          {
            "name": "Xã Nghĩa Đồng",
            "code": "40319091"
          },
          {
            "name": "Xã Giai Xuân",
            "code": "40319092"
          },
          {
            "name": "Xã Nghĩa Hành",
            "code": "40319093"
          },
          {
            "name": "Xã Tiên Đồng",
            "code": "40319094"
          }
        ]
      },
      {
        "name": "Huyện Thanh Chương",
        "code": "40331",
        "wards": [
          {
            "name": "Xã Cát Ngạn",
            "code": "40331098"
          },
          {
            "name": "Xã Tam Đồng",
            "code": "40331099"
          },
          {
            "name": "Xã Hạnh Lâm",
            "code": "40331100"
          },
          {
            "name": "Xã Sơn Lâm",
            "code": "40331101"
          },
          {
            "name": "Xã Hoa Quân",
            "code": "40331102"
          },
          {
            "name": "Xã Kim Bảng",
            "code": "40331103"
          },
          {
            "name": "Xã Bích Hào",
            "code": "40331104"
          },
          {
            "name": "Xã Đại Đồng",
            "code": "40331105"
          },
          {
            "name": "Xã Xuân Lâm",
            "code": "40331106"
          }
        ]
      },
      {
        "name": "Huyện Tương Dương",
        "code": "40315",
        "wards": [
          {
            "name": "Xã Tam Quang",
            "code": "40315107"
          },
          {
            "name": "Xã Tam Thái",
            "code": "40315108"
          },
          {
            "name": "Xã Tương Dương",
            "code": "40315109"
          },
          {
            "name": "Xã Lượng Minh",
            "code": "40315110"
          },
          {
            "name": "Xã Yên Na",
            "code": "40315111"
          },
          {
            "name": "Xã Yên Hoà",
            "code": "40315112"
          },
          {
            "name": "Xã Nga My",
            "code": "40315113"
          },
          {
            "name": "Xã Hữu Khuông",
            "code": "40315114"
          },
          {
            "name": "Xã Nhôn Mai",
            "code": "40315115"
          }
        ]
      },
      {
        "name": "Huyện Yên Thành",
        "code": "40323",
        "wards": [
          {
            "name": "Xã Yên Thành",
            "code": "40323122"
          },
          {
            "name": "Xã Quan Thành",
            "code": "40323123"
          },
          {
            "name": "Xã Hợp Minh",
            "code": "40323124"
          },
          {
            "name": "Xã Vân Tụ",
            "code": "40323125"
          },
          {
            "name": "Xã Vân Du",
            "code": "40323126"
          },
          {
            "name": "Xã Quang Đồng",
            "code": "40323127"
          },
          {
            "name": "Xã Giai Lạc",
            "code": "40323128"
          },
          {
            "name": "Xã Bình Minh",
            "code": "40323129"
          },
          {
            "name": "Xã Đông Thành",
            "code": "40323130"
          }
        ]
      },
      {
        "name": "Thành phố Vinh",
        "code": "40301",
        "wards": [
          {
            "name": "Phường Trường Vinh",
            "code": "40301116"
          },
          {
            "name": "Phường Thành Vinh",
            "code": "40301117"
          },
          {
            "name": "Phường Vinh Hưng",
            "code": "40301118"
          },
          {
            "name": "Phường Vinh Phú",
            "code": "40301119"
          },
          {
            "name": "Phường Vinh Lộc",
            "code": "40301120"
          },
          {
            "name": "Phường Cửa Lò",
            "code": "40301121"
          }
        ]
      },
      {
        "name": "Thị xã Hoàng Mai",
        "code": "40339",
        "wards": [
          {
            "name": "Phường Hoàng Mai",
            "code": "40339027"
          },
          {
            "name": "Phường Tân Mai",
            "code": "40339028"
          },
          {
            "name": "Phường Quỳnh Mai",
            "code": "40339029"
          }
        ]
      },
      {
        "name": "Thị xã Thái Hoà",
        "code": "40314",
        "wards": [
          {
            "name": "Phường Thái Hoà",
            "code": "40314095"
          },
          {
            "name": "Phường Tây Hiếu",
            "code": "40314096"
          },
          {
            "name": "Xã Đông Hiếu",
            "code": "40314097"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Ninh Bình",
    "code": "06",
    "districts": [
      {
        "name": "Huyện Bình Lục",
        "code": "11111",
        "wards": [
          {
            "name": "Xã Bình Lục",
            "code": "11111032"
          },
          {
            "name": "Xã Bình Mỹ",
            "code": "11111033"
          },
          {
            "name": "Xã Bình An",
            "code": "11111034"
          },
          {
            "name": "Xã Bình Giang",
            "code": "11111035"
          },
          {
            "name": "Xã Bình Sơn",
            "code": "11111036"
          }
        ]
      },
      {
        "name": "Huyện Gia Viễn",
        "code": "11707",
        "wards": [
          {
            "name": "Xã Gia Viễn",
            "code": "11707001"
          },
          {
            "name": "Xã Đại Hoàng",
            "code": "11707002"
          },
          {
            "name": "Xã Gia Hưng",
            "code": "11707003"
          },
          {
            "name": "Xã Gia Phong",
            "code": "11707004"
          },
          {
            "name": "Xã Gia Vân",
            "code": "11707005"
          },
          {
            "name": "Xã Gia Trấn",
            "code": "11707006"
          }
        ]
      },
      {
        "name": "Huyện Giao Thuỷ",
        "code": "11315",
        "wards": [
          {
            "name": "Xã Giao Minh",
            "code": "11315084"
          },
          {
            "name": "Xã Giao Hoà",
            "code": "11315085"
          },
          {
            "name": "Xã Giao Thuỷ",
            "code": "11315086"
          },
          {
            "name": "Xã Giao Phúc",
            "code": "11315087"
          },
          {
            "name": "Xã Giao Hưng",
            "code": "11315088"
          },
          {
            "name": "Xã Giao Bình",
            "code": "11315089"
          },
          {
            "name": "Xã Giao Ninh",
            "code": "11315090"
          }
        ]
      },
      {
        "name": "Huyện Hải Hậu",
        "code": "11319",
        "wards": [
          {
            "name": "Xã Hải Hậu",
            "code": "11319076"
          },
          {
            "name": "Xã Hải Anh",
            "code": "11319077"
          },
          {
            "name": "Xã Hải Tiến",
            "code": "11319078"
          },
          {
            "name": "Xã Hải Hưng",
            "code": "11319079"
          },
          {
            "name": "Xã Hải An",
            "code": "11319080"
          },
          {
            "name": "Xã Hải Quang",
            "code": "11319081"
          },
          {
            "name": "Xã Hải Xuân",
            "code": "11319082"
          },
          {
            "name": "Xã Hải Thịnh",
            "code": "11319083"
          }
        ]
      },
      {
        "name": "Huyện Kim Sơn",
        "code": "11715",
        "wards": [
          {
            "name": "Xã Chất Bình",
            "code": "11715024"
          },
          {
            "name": "Xã Kim Sơn",
            "code": "11715025"
          },
          {
            "name": "Xã Quang Thiện",
            "code": "11715026"
          },
          {
            "name": "Xã Phát Diệm",
            "code": "11715027"
          },
          {
            "name": "Xã Lai Thành",
            "code": "11715028"
          },
          {
            "name": "Xã Định Hóa",
            "code": "11715029"
          },
          {
            "name": "Xã Bình Minh",
            "code": "11715030"
          },
          {
            "name": "Xã Kim Đông",
            "code": "11715031"
          }
        ]
      },
      {
        "name": "Huyện Lý Nhân",
        "code": "11107",
        "wards": [
          {
            "name": "Xã Lý Nhân",
            "code": "11107042"
          },
          {
            "name": "Xã Nam Xang",
            "code": "11107043"
          },
          {
            "name": "Xã Bắc Lý",
            "code": "11107044"
          },
          {
            "name": "Xã Vĩnh Trụ",
            "code": "11107045"
          },
          {
            "name": "Xã Trần Thương",
            "code": "11107046"
          },
          {
            "name": "Xã Nhân Hà",
            "code": "11107047"
          },
          {
            "name": "Xã Nam Lý",
            "code": "11107048"
          }
        ]
      },
      {
        "name": "Huyện Nam Trực",
        "code": "11309",
        "wards": [
          {
            "name": "Xã Nam Trực",
            "code": "11309049"
          },
          {
            "name": "Xã Nam Minh",
            "code": "11309050"
          },
          {
            "name": "Xã Nam Đồng",
            "code": "11309051"
          },
          {
            "name": "Xã Nam Ninh",
            "code": "11309052"
          },
          {
            "name": "Xã Nam Hồng",
            "code": "11309053"
          },
          {
            "name": "Phường Hồng Quang",
            "code": "11309128"
          }
        ]
      },
      {
        "name": "Huyện Nghĩa Hưng",
        "code": "11317",
        "wards": [
          {
            "name": "Xã Đồng Thịnh",
            "code": "11317091"
          },
          {
            "name": "Xã Nghĩa Hưng",
            "code": "11317092"
          },
          {
            "name": "Xã Nghĩa Sơn",
            "code": "11317093"
          },
          {
            "name": "Xã Hồng Phong",
            "code": "11317094"
          },
          {
            "name": "Xã Quỹ Nhất",
            "code": "11317095"
          },
          {
            "name": "Xã Nghĩa Lâm",
            "code": "11317096"
          },
          {
            "name": "Xã Rạng Đông",
            "code": "11317097"
          }
        ]
      },
      {
        "name": "Huyện Nho quan",
        "code": "11705",
        "wards": [
          {
            "name": "Xã Nho Quan",
            "code": "11705007"
          },
          {
            "name": "Xã Gia Lâm",
            "code": "11705008"
          },
          {
            "name": "Xã Gia Tường",
            "code": "11705009"
          },
          {
            "name": "Xã Phú Sơn",
            "code": "11705010"
          },
          {
            "name": "Xã Cúc Phương",
            "code": "11705011"
          },
          {
            "name": "Xã Phú Long",
            "code": "11705012"
          },
          {
            "name": "Xã Thanh Sơn",
            "code": "11705013"
          },
          {
            "name": "Xã Quỳnh Lưu",
            "code": "11705014"
          }
        ]
      },
      {
        "name": "Huyện Thanh Liêm",
        "code": "11109",
        "wards": [
          {
            "name": "Xã Liêm Hà",
            "code": "11109037"
          },
          {
            "name": "Xã Tân Thanh",
            "code": "11109038"
          },
          {
            "name": "Xã Thanh Bình",
            "code": "11109039"
          },
          {
            "name": "Xã Thanh Lâm",
            "code": "11109040"
          },
          {
            "name": "Xã Thanh Liêm",
            "code": "11109041"
          }
        ]
      },
      {
        "name": "Huyện Trực Ninh",
        "code": "11311",
        "wards": [
          {
            "name": "Xã Cổ Lễ",
            "code": "11311065"
          },
          {
            "name": "Xã Ninh Giang",
            "code": "11311066"
          },
          {
            "name": "Xã Cát Thành",
            "code": "11311067"
          },
          {
            "name": "Xã Trực Ninh",
            "code": "11311068"
          },
          {
            "name": "Xã Quang Hưng",
            "code": "11311069"
          },
          {
            "name": "Xã Minh Thái",
            "code": "11311070"
          },
          {
            "name": "Xã Ninh Cường",
            "code": "11311071"
          }
        ]
      },
      {
        "name": "Huyện Vụ Bản",
        "code": "11303",
        "wards": [
          {
            "name": "Xã Minh Tân",
            "code": "11303054"
          },
          {
            "name": "Xã Hiển Khánh",
            "code": "11303055"
          },
          {
            "name": "Xã Vụ Bản",
            "code": "11303056"
          },
          {
            "name": "Xã Liên Minh",
            "code": "11303057"
          }
        ]
      },
      {
        "name": "Huyện Xuân Trường",
        "code": "11313",
        "wards": [
          {
            "name": "Xã Xuân Trường",
            "code": "11313072"
          },
          {
            "name": "Xã Xuân Hưng",
            "code": "11313073"
          },
          {
            "name": "Xã Xuân Giang",
            "code": "11313074"
          },
          {
            "name": "Xã Xuân Hồng",
            "code": "11313075"
          }
        ]
      },
      {
        "name": "Huyện Ý Yên",
        "code": "11307",
        "wards": [
          {
            "name": "Xã Ý Yên",
            "code": "11307058"
          },
          {
            "name": "Xã Yên Đồng",
            "code": "11307059"
          },
          {
            "name": "Xã Yên Cường",
            "code": "11307060"
          },
          {
            "name": "Xã Vạn Thắng",
            "code": "11307061"
          },
          {
            "name": "Xã Vũ Dương",
            "code": "11307062"
          },
          {
            "name": "Xã Tân Minh",
            "code": "11307063"
          },
          {
            "name": "Xã Phong Doanh",
            "code": "11307064"
          }
        ]
      },
      {
        "name": "Huyện Yên Khánh",
        "code": "11713",
        "wards": [
          {
            "name": "Xã Yên Khánh",
            "code": "11713015"
          },
          {
            "name": "Xã Khánh Nhạc",
            "code": "11713016"
          },
          {
            "name": "Xã Khánh Thiện",
            "code": "11713017"
          },
          {
            "name": "Xã Khánh Hội",
            "code": "11713018"
          },
          {
            "name": "Xã Khánh Trung",
            "code": "11713019"
          },
          {
            "name": "Phường Đông Hoa Lư",
            "code": "11713101"
          }
        ]
      },
      {
        "name": "Huyện Yên Mô",
        "code": "11711",
        "wards": [
          {
            "name": "Xã Yên Mô",
            "code": "11711020"
          },
          {
            "name": "Xã Yên Từ",
            "code": "11711021"
          },
          {
            "name": "Xã Yên Mạc",
            "code": "11711022"
          },
          {
            "name": "Xã Đồng Thái",
            "code": "11711023"
          }
        ]
      },
      {
        "name": "Thành phố Hoa Lư",
        "code": "11709",
        "wards": [
          {
            "name": "Phường Tây Hoa Lư",
            "code": "11709098"
          },
          {
            "name": "Phường Hoa Lư",
            "code": "11709099"
          },
          {
            "name": "Phường Nam Hoa Lư",
            "code": "11709100"
          }
        ]
      },
      {
        "name": "Thành phố Nam Định",
        "code": "11301",
        "wards": [
          {
            "name": "Phường Nam Định",
            "code": "11301122"
          },
          {
            "name": "Phường Thiên Trường",
            "code": "11301123"
          },
          {
            "name": "Phường Đông A",
            "code": "11301124"
          },
          {
            "name": "Phường Vị Khê",
            "code": "11301125"
          },
          {
            "name": "Phường Thành Nam",
            "code": "11301126"
          },
          {
            "name": "Phường Trường Thi",
            "code": "11301127"
          },
          {
            "name": "Phường Mỹ Lộc",
            "code": "11301129"
          }
        ]
      },
      {
        "name": "Thành phố Phủ Lý",
        "code": "11101",
        "wards": [
          {
            "name": "Phường Hà Nam",
            "code": "11101106"
          },
          {
            "name": "Phường Phủ Lý",
            "code": "11101107"
          },
          {
            "name": "Phường Phù Vân",
            "code": "11101108"
          },
          {
            "name": "Phường Châu Sơn",
            "code": "11101109"
          },
          {
            "name": "Phường Liêm Tuyền",
            "code": "11101110"
          }
        ]
      },
      {
        "name": "Thành phố Tam Điệp",
        "code": "11703",
        "wards": [
          {
            "name": "Phường Tam Điệp",
            "code": "11703102"
          },
          {
            "name": "Phường Yên Sơn",
            "code": "11703103"
          },
          {
            "name": "Phường Trung Sơn",
            "code": "11703104"
          },
          {
            "name": "Phường Yên Thắng",
            "code": "11703105"
          }
        ]
      },
      {
        "name": "Thị xã Duy Tiên",
        "code": "11103",
        "wards": [
          {
            "name": "Phường Duy Tiên",
            "code": "11103111"
          },
          {
            "name": "Phường Duy Tân",
            "code": "11103112"
          },
          {
            "name": "Phường Đồng Văn",
            "code": "11103113"
          },
          {
            "name": "Phường Duy Hà",
            "code": "11103114"
          },
          {
            "name": "Phường Tiên Sơn",
            "code": "11103115"
          }
        ]
      },
      {
        "name": "Thị xã Kim Bảng",
        "code": "11105",
        "wards": [
          {
            "name": "Phường Lê Hồ",
            "code": "11105116"
          },
          {
            "name": "Phường Nguyễn Úy",
            "code": "11105117"
          },
          {
            "name": "Phường Lý Thường Kiệt",
            "code": "11105118"
          },
          {
            "name": "Phường Kim Thanh",
            "code": "11105119"
          },
          {
            "name": "Phường Tam Chúc",
            "code": "11105120"
          },
          {
            "name": "Phường Kim Bảng",
            "code": "11105121"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Phú Thọ",
    "code": "12",
    "districts": [
      {
        "name": "Huyện Bình Xuyên",
        "code": "21913",
        "wards": [
          {
            "name": "Xã Bình Nguyên",
            "code": "21913095"
          },
          {
            "name": "Xã Xuân Lãng",
            "code": "21913096"
          },
          {
            "name": "Xã Bình Xuyên",
            "code": "21913097"
          },
          {
            "name": "Xã Bình Tuyền",
            "code": "21913098"
          }
        ]
      },
      {
        "name": "Huyện Cao Phong",
        "code": "30510",
        "wards": [
          {
            "name": "Xã Cao Phong",
            "code": "30510103"
          },
          {
            "name": "Xã Mường Thàng",
            "code": "30510104"
          },
          {
            "name": "Xã Thung Nai",
            "code": "30510105"
          }
        ]
      },
      {
        "name": "Huyện Cẩm Khê",
        "code": "21713",
        "wards": [
          {
            "name": "Xã Cẩm Khê",
            "code": "21713035"
          },
          {
            "name": "Xã Phú Khê",
            "code": "21713036"
          },
          {
            "name": "Xã Hùng Việt",
            "code": "21713037"
          },
          {
            "name": "Xã Đồng Lương",
            "code": "21713038"
          },
          {
            "name": "Xã Tiên Lương",
            "code": "21713039"
          },
          {
            "name": "Xã Vân Bán",
            "code": "21713040"
          }
        ]
      },
      {
        "name": "Huyện Đà Bắc",
        "code": "30503",
        "wards": [
          {
            "name": "Xã Đà Bắc",
            "code": "30503106"
          },
          {
            "name": "Xã Cao Sơn",
            "code": "30503107"
          },
          {
            "name": "Xã Đức Nhàn",
            "code": "30503108"
          },
          {
            "name": "Xã Quy Đức",
            "code": "30503109"
          },
          {
            "name": "Xã Tân Pheo",
            "code": "30503110"
          },
          {
            "name": "Xã Tiền Phong",
            "code": "30503111"
          }
        ]
      },
      {
        "name": "Huyện Đoan Hùng",
        "code": "21705",
        "wards": [
          {
            "name": "Xã Đoan Hùng",
            "code": "21705024"
          },
          {
            "name": "Xã Tây Cốc",
            "code": "21705025"
          },
          {
            "name": "Xã Chân Mộng",
            "code": "21705026"
          },
          {
            "name": "Xã Chí Đám",
            "code": "21705027"
          },
          {
            "name": "Xã Bằng Luân",
            "code": "21705028"
          }
        ]
      },
      {
        "name": "Huyện Hạ Hoà",
        "code": "21707",
        "wards": [
          {
            "name": "Xã Hạ Hòa",
            "code": "21707029"
          },
          {
            "name": "Xã Đan Thượng",
            "code": "21707030"
          },
          {
            "name": "Xã Yên Kỳ",
            "code": "21707031"
          },
          {
            "name": "Xã Vĩnh Chân",
            "code": "21707032"
          },
          {
            "name": "Xã Văn Lang",
            "code": "21707033"
          },
          {
            "name": "Xã Hiền Lương",
            "code": "21707034"
          }
        ]
      },
      {
        "name": "Huyện Kim Bôi",
        "code": "30511",
        "wards": [
          {
            "name": "Xã Kim Bôi",
            "code": "30511112"
          },
          {
            "name": "Xã Mường Động",
            "code": "30511113"
          },
          {
            "name": "Xã Dũng Tiến",
            "code": "30511114"
          },
          {
            "name": "Xã Hợp Kim",
            "code": "30511115"
          },
          {
            "name": "Xã Nật Sơn",
            "code": "30511116"
          }
        ]
      },
      {
        "name": "Huyện Lạc Sơn",
        "code": "30515",
        "wards": [
          {
            "name": "Xã Lạc Sơn",
            "code": "30515117"
          },
          {
            "name": "Xã Mường Vang",
            "code": "30515118"
          },
          {
            "name": "Xã Đại Đồng",
            "code": "30515119"
          },
          {
            "name": "Xã Ngọc Sơn",
            "code": "30515120"
          },
          {
            "name": "Xã Nhân Nghĩa",
            "code": "30515121"
          },
          {
            "name": "Xã Quyết Thắng",
            "code": "30515122"
          },
          {
            "name": "Xã Thượng Cốc",
            "code": "30515123"
          },
          {
            "name": "Xã Yên Phú",
            "code": "30515124"
          }
        ]
      },
      {
        "name": "Huyện Lạc Thuỷ",
        "code": "30517",
        "wards": [
          {
            "name": "Xã Lạc Thủy",
            "code": "30517125"
          },
          {
            "name": "Xã An Bình",
            "code": "30517126"
          },
          {
            "name": "Xã An Nghĩa",
            "code": "30517127"
          }
        ]
      },
      {
        "name": "Huyện Lâm Thao",
        "code": "21721",
        "wards": [
          {
            "name": "Xã Lâm Thao",
            "code": "21721006"
          },
          {
            "name": "Xã Xuân Lũng",
            "code": "21721007"
          },
          {
            "name": "Xã Phùng Nguyên",
            "code": "21721008"
          },
          {
            "name": "Xã Bản Nguyên",
            "code": "21721009"
          }
        ]
      },
      {
        "name": "Huyện Lập Thạch",
        "code": "21903",
        "wards": [
          {
            "name": "Xã Lập Thạch",
            "code": "21903071"
          },
          {
            "name": "Xã Tiên Lữ",
            "code": "21903072"
          },
          {
            "name": "Xã Thái Hòa",
            "code": "21903073"
          },
          {
            "name": "Xã Liên Hòa",
            "code": "21903074"
          },
          {
            "name": "Xã Hợp Lý",
            "code": "21903075"
          },
          {
            "name": "Xã Sơn Đông",
            "code": "21903076"
          }
        ]
      },
      {
        "name": "Huyện Lương Sơn",
        "code": "30509",
        "wards": [
          {
            "name": "Xã Lương Sơn",
            "code": "30509128"
          },
          {
            "name": "Xã Cao Dương",
            "code": "30509129"
          },
          {
            "name": "Xã Liên Sơn",
            "code": "30509130"
          }
        ]
      },
      {
        "name": "Huyện Mai Châu",
        "code": "30505",
        "wards": [
          {
            "name": "Xã Mai Châu",
            "code": "30505131"
          },
          {
            "name": "Xã Bao La",
            "code": "30505132"
          },
          {
            "name": "Xã Mai Hạ",
            "code": "30505133"
          },
          {
            "name": "Xã Pà Cò",
            "code": "30505134"
          },
          {
            "name": "Xã Tân Mai",
            "code": "30505135"
          }
        ]
      },
      {
        "name": "Huyện Phù Ninh",
        "code": "21711",
        "wards": [
          {
            "name": "Xã Phù Ninh",
            "code": "21711013"
          },
          {
            "name": "Xã Dân Chủ",
            "code": "21711014"
          },
          {
            "name": "Xã Phú Mỹ",
            "code": "21711015"
          },
          {
            "name": "Xã Trạm Thản",
            "code": "21711016"
          },
          {
            "name": "Xã Bình Phú",
            "code": "21711017"
          }
        ]
      },
      {
        "name": "Huyện Sông Lô",
        "code": "21915",
        "wards": [
          {
            "name": "Xã Tam Sơn",
            "code": "21915067"
          },
          {
            "name": "Xã Sông Lô",
            "code": "21915068"
          },
          {
            "name": "Xã Hải Lựu",
            "code": "21915069"
          },
          {
            "name": "Xã Yên Lãng",
            "code": "21915070"
          }
        ]
      },
      {
        "name": "Huyện Tam Dương",
        "code": "21905",
        "wards": [
          {
            "name": "Xã Tam Dương",
            "code": "21905080"
          },
          {
            "name": "Xã Hội Thịnh",
            "code": "21905081"
          },
          {
            "name": "Xã Hoàng An",
            "code": "21905082"
          },
          {
            "name": "Xã Tam Dương Bắc",
            "code": "21905083"
          }
        ]
      },
      {
        "name": "Huyện Tam Đảo",
        "code": "21904",
        "wards": [
          {
            "name": "Xã Tam Đảo",
            "code": "21904077"
          },
          {
            "name": "Xã Đại Đình",
            "code": "21904078"
          },
          {
            "name": "Xã Đạo Trù",
            "code": "21904079"
          }
        ]
      },
      {
        "name": "Huyện Tam Nông",
        "code": "21717",
        "wards": [
          {
            "name": "Xã Tam Nông",
            "code": "21717041"
          },
          {
            "name": "Xã Thọ Văn",
            "code": "21717042"
          },
          {
            "name": "Xã Vạn Xuân",
            "code": "21717043"
          },
          {
            "name": "Xã Hiền Quan",
            "code": "21717044"
          }
        ]
      },
      {
        "name": "Huyện Tân Lạc",
        "code": "30513",
        "wards": [
          {
            "name": "Xã Tân Lạc",
            "code": "30513136"
          },
          {
            "name": "Xã Mường Bi",
            "code": "30513137"
          },
          {
            "name": "Xã Mường Hoa",
            "code": "30513138"
          },
          {
            "name": "Xã Toàn Thắng",
            "code": "30513139"
          },
          {
            "name": "Xã Vân Sơn",
            "code": "30513140"
          }
        ]
      },
      {
        "name": "Huyện Tân Sơn",
        "code": "21720",
        "wards": [
          {
            "name": "Xã Tân Sơn",
            "code": "21720055"
          },
          {
            "name": "Xã Minh Đài",
            "code": "21720056"
          },
          {
            "name": "Xã Lai Đồng",
            "code": "21720057"
          },
          {
            "name": "Xã Thu Cúc",
            "code": "21720058"
          },
          {
            "name": "Xã Xuân Đài",
            "code": "21720059"
          },
          {
            "name": "Xã Long Cốc",
            "code": "21720060"
          }
        ]
      },
      {
        "name": "Huyện Thanh Ba",
        "code": "21709",
        "wards": [
          {
            "name": "Xã Thanh Ba",
            "code": "21709018"
          },
          {
            "name": "Xã Quảng Yên",
            "code": "21709019"
          },
          {
            "name": "Xã Hoàng Cương",
            "code": "21709020"
          },
          {
            "name": "Xã Đông Thành",
            "code": "21709021"
          },
          {
            "name": "Xã Chí Tiên",
            "code": "21709022"
          },
          {
            "name": "Xã Liên Minh",
            "code": "21709023"
          }
        ]
      },
      {
        "name": "Huyện Thanh Sơn",
        "code": "21719",
        "wards": [
          {
            "name": "Xã Thanh Sơn",
            "code": "21719048"
          },
          {
            "name": "Xã Võ Miếu",
            "code": "21719049"
          },
          {
            "name": "Xã Văn Miếu",
            "code": "21719050"
          },
          {
            "name": "Xã Cự Đồng",
            "code": "21719051"
          },
          {
            "name": "Xã Hương Cần",
            "code": "21719052"
          },
          {
            "name": "Xã Yên Sơn",
            "code": "21719053"
          },
          {
            "name": "Xã Khả Cửu",
            "code": "21719054"
          }
        ]
      },
      {
        "name": "Huyện Thanh Thuỷ",
        "code": "21723",
        "wards": [
          {
            "name": "Xã Thanh Thuỷ",
            "code": "21723045"
          },
          {
            "name": "Xã Đào Xá",
            "code": "21723046"
          },
          {
            "name": "Xã Tu Vũ",
            "code": "21723047"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Tường",
        "code": "21907",
        "wards": [
          {
            "name": "Xã Vĩnh Tường",
            "code": "21907084"
          },
          {
            "name": "Xã Thổ Tang",
            "code": "21907085"
          },
          {
            "name": "Xã Vĩnh Hưng",
            "code": "21907086"
          },
          {
            "name": "Xã Vĩnh An",
            "code": "21907087"
          },
          {
            "name": "Xã Vĩnh Phú",
            "code": "21907088"
          },
          {
            "name": "Xã Vĩnh Thành",
            "code": "21907089"
          }
        ]
      },
      {
        "name": "Huyện Yên Lạc",
        "code": "21909",
        "wards": [
          {
            "name": "Xã Yên Lạc",
            "code": "21909090"
          },
          {
            "name": "Xã Tề Lỗ",
            "code": "21909091"
          },
          {
            "name": "Xã Liên Châu",
            "code": "21909092"
          },
          {
            "name": "Xã Tam Hồng",
            "code": "21909093"
          },
          {
            "name": "Xã Nguyệt Đức",
            "code": "21909094"
          }
        ]
      },
      {
        "name": "Huyện Yên Lập",
        "code": "21715",
        "wards": [
          {
            "name": "Xã Yên Lập",
            "code": "21715061"
          },
          {
            "name": "Xã Thượng Long",
            "code": "21715062"
          },
          {
            "name": "Xã Sơn Lương",
            "code": "21715063"
          },
          {
            "name": "Xã Xuân Viên",
            "code": "21715064"
          },
          {
            "name": "Xã Minh Hòa",
            "code": "21715065"
          },
          {
            "name": "Xã Trung Sơn",
            "code": "21715066"
          }
        ]
      },
      {
        "name": "Huyện Yên Thuỷ",
        "code": "30519",
        "wards": [
          {
            "name": "Xã Yên Thủy",
            "code": "30519141"
          },
          {
            "name": "Xã Lạc Lương",
            "code": "30519142"
          },
          {
            "name": "Xã Yên Trị",
            "code": "30519143"
          }
        ]
      },
      {
        "name": "Thành phố Hoà Bình",
        "code": "30501",
        "wards": [
          {
            "name": "Xã Thịnh Minh",
            "code": "30501144"
          },
          {
            "name": "Phường Hoà Bình",
            "code": "30501145"
          },
          {
            "name": "Phường Kỳ Sơn",
            "code": "30501146"
          },
          {
            "name": "Phường Tân Hoà",
            "code": "30501147"
          },
          {
            "name": "Phường Thống Nhất",
            "code": "30501148"
          }
        ]
      },
      {
        "name": "Thành phố Phúc Yên",
        "code": "21902",
        "wards": [
          {
            "name": "Phường Phúc Yên",
            "code": "21902101"
          },
          {
            "name": "Phường Xuân Hòa",
            "code": "21902102"
          }
        ]
      },
      {
        "name": "Thành phố Việt Trì",
        "code": "21701",
        "wards": [
          {
            "name": "Phường Việt Trì",
            "code": "21701001"
          },
          {
            "name": "Phường Nông Trang",
            "code": "21701002"
          },
          {
            "name": "Phường Thanh Miếu",
            "code": "21701003"
          },
          {
            "name": "Phường Vân Phú",
            "code": "21701004"
          },
          {
            "name": "Xã Hy Cương",
            "code": "21701005"
          }
        ]
      },
      {
        "name": "Thành phố Vĩnh Yên",
        "code": "21901",
        "wards": [
          {
            "name": "Phường Vĩnh Phúc",
            "code": "21901099"
          },
          {
            "name": "Phường Vĩnh Yên",
            "code": "21901100"
          }
        ]
      },
      {
        "name": "Thị xã Phú Thọ",
        "code": "21703",
        "wards": [
          {
            "name": "Phường Phong Châu",
            "code": "21703010"
          },
          {
            "name": "Phường Phú Thọ",
            "code": "21703011"
          },
          {
            "name": "Phường Âu Cơ",
            "code": "21703012"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Quảng Ngãi",
    "code": "22",
    "districts": [
      {
        "name": "Huyện Ba Tơ",
        "code": "50525",
        "wards": [
          {
            "name": "Xã Ba Vì",
            "code": "50525048"
          },
          {
            "name": "Xã Ba Tô",
            "code": "50525049"
          },
          {
            "name": "Xã Ba Dinh",
            "code": "50525050"
          },
          {
            "name": "Xã Ba Tơ",
            "code": "50525051"
          },
          {
            "name": "Xã Ba Vinh",
            "code": "50525052"
          },
          {
            "name": "Xã Ba Động",
            "code": "50525053"
          },
          {
            "name": "Xã Đặng Thùy Trâm",
            "code": "50525054"
          },
          {
            "name": "Xã Ba Xa",
            "code": "50525055"
          }
        ]
      },
      {
        "name": "Huyện Bình Sơn",
        "code": "50505",
        "wards": [
          {
            "name": "Xã Bình Minh",
            "code": "50505011"
          },
          {
            "name": "Xã Bình Chương",
            "code": "50505012"
          },
          {
            "name": "Xã Bình Sơn",
            "code": "50505013"
          },
          {
            "name": "Xã Vạn Tường",
            "code": "50505014"
          },
          {
            "name": "Xã Đông Sơn",
            "code": "50505015"
          }
        ]
      },
      {
        "name": "Huyện Đắk Glei",
        "code": "60103",
        "wards": [
          {
            "name": "Xã Xốp",
            "code": "60103078"
          },
          {
            "name": "Xã Ngọc Linh",
            "code": "60103079"
          },
          {
            "name": "Xã Đăk Plô",
            "code": "60103080"
          },
          {
            "name": "Xã Đăk Pék",
            "code": "60103081"
          },
          {
            "name": "Xã Đăk Môn",
            "code": "60103082"
          },
          {
            "name": "Xã Đăk Long",
            "code": "60103093"
          }
        ]
      },
      {
        "name": "Huyện Đăk Hà",
        "code": "60111",
        "wards": [
          {
            "name": "Xã Đăk Pxi",
            "code": "60111063"
          },
          {
            "name": "Xã Đăk Mar",
            "code": "60111064"
          },
          {
            "name": "Xã Đăk Ui",
            "code": "60111065"
          },
          {
            "name": "Xã Ngọk Réo",
            "code": "60111066"
          },
          {
            "name": "Xã Đăk Hà",
            "code": "60111067"
          }
        ]
      },
      {
        "name": "Huyện Đắk Tô",
        "code": "60107",
        "wards": [
          {
            "name": "Xã Ngọk Tụ",
            "code": "60107068"
          },
          {
            "name": "Xã Đăk Tô",
            "code": "60107069"
          },
          {
            "name": "Xã Kon Đào",
            "code": "60107070"
          }
        ]
      },
      {
        "name": "Huyện Ia H'Drai",
        "code": "60114",
        "wards": [
          {
            "name": "Xã Ia Tơi",
            "code": "60114086"
          },
          {
            "name": "Xã Ia Đal",
            "code": "60114096"
          }
        ]
      },
      {
        "name": "Huyện Kon Plông",
        "code": "60109",
        "wards": [
          {
            "name": "Xã Măng Đen",
            "code": "60109090"
          },
          {
            "name": "Xã Măng Bút",
            "code": "60109091"
          },
          {
            "name": "Xã Kon Plông",
            "code": "60109092"
          }
        ]
      },
      {
        "name": "Huyện Kon Rẫy",
        "code": "60108",
        "wards": [
          {
            "name": "Xã Đăk Kôi",
            "code": "60108087"
          },
          {
            "name": "Xã Kon Braih",
            "code": "60108088"
          },
          {
            "name": "Xã Đăk Rve",
            "code": "60108089"
          }
        ]
      },
      {
        "name": "Huyện Lý Sơn",
        "code": "50503",
        "wards": [
          {
            "name": "Đặc khu Lý Sơn",
            "code": "50503056"
          }
        ]
      },
      {
        "name": "Huyện Minh Long",
        "code": "50519",
        "wards": [
          {
            "name": "Xã Minh Long",
            "code": "50519046"
          },
          {
            "name": "Xã Sơn Mai",
            "code": "50519047"
          }
        ]
      },
      {
        "name": "Huyện Mộ Đức",
        "code": "50521",
        "wards": [
          {
            "name": "Xã Long Phụng",
            "code": "50521028"
          },
          {
            "name": "Xã Mỏ Cày",
            "code": "50521029"
          },
          {
            "name": "Xã Mộ Đức",
            "code": "50521030"
          },
          {
            "name": "Xã Lân Phong",
            "code": "50521031"
          }
        ]
      },
      {
        "name": "Huyện Nghĩa Hành",
        "code": "50517",
        "wards": [
          {
            "name": "Xã Nghĩa Hành",
            "code": "50517024"
          },
          {
            "name": "Xã Đình Cương",
            "code": "50517025"
          },
          {
            "name": "Xã Thiện Tín",
            "code": "50517026"
          },
          {
            "name": "Xã Phước Giang",
            "code": "50517027"
          }
        ]
      },
      {
        "name": "Huyện Ngọc Hồi",
        "code": "60105",
        "wards": [
          {
            "name": "Xã Bờ Y",
            "code": "60105075"
          },
          {
            "name": "Xã Sa Loong",
            "code": "60105076"
          },
          {
            "name": "Xã Dục Nông",
            "code": "60105077"
          }
        ]
      },
      {
        "name": "Huyện Sa Thầy",
        "code": "60113",
        "wards": [
          {
            "name": "Xã Sa Thầy",
            "code": "60113083"
          },
          {
            "name": "Xã Sa Bình",
            "code": "60113084"
          },
          {
            "name": "Xã Ya Ly",
            "code": "60113085"
          },
          {
            "name": "Xã Rờ Kơi",
            "code": "60113094"
          },
          {
            "name": "Xã Mô Rai",
            "code": "60113095"
          }
        ]
      },
      {
        "name": "Huyện Sơn Hà",
        "code": "50513",
        "wards": [
          {
            "name": "Xã Sơn Hạ",
            "code": "50513038"
          },
          {
            "name": "Xã Sơn Linh",
            "code": "50513039"
          },
          {
            "name": "Xã Sơn Hà",
            "code": "50513040"
          },
          {
            "name": "Xã Sơn Thủy",
            "code": "50513041"
          },
          {
            "name": "Xã Sơn Kỳ",
            "code": "50513042"
          }
        ]
      },
      {
        "name": "Huyện Sơn Tây",
        "code": "50511",
        "wards": [
          {
            "name": "Xã Sơn Tây",
            "code": "50511043"
          },
          {
            "name": "Xã Sơn Tây Thượng",
            "code": "50511044"
          },
          {
            "name": "Xã Sơn Tây Hạ",
            "code": "50511045"
          }
        ]
      },
      {
        "name": "Huyện Sơn Tịnh",
        "code": "50509",
        "wards": [
          {
            "name": "Xã Trường Giang",
            "code": "50509016"
          },
          {
            "name": "Xã Ba Gia",
            "code": "50509017"
          },
          {
            "name": "Xã Sơn Tịnh",
            "code": "50509018"
          },
          {
            "name": "Xã Thọ Phong",
            "code": "50509019"
          }
        ]
      },
      {
        "name": "Huyện Trà Bồng",
        "code": "50507",
        "wards": [
          {
            "name": "Xã Trà Bồng",
            "code": "50507032"
          },
          {
            "name": "Xã Đông Trà Bồng",
            "code": "50507033"
          },
          {
            "name": "Xã Tây Trà",
            "code": "50507034"
          },
          {
            "name": "Xã Thanh Bồng",
            "code": "50507035"
          },
          {
            "name": "Xã Cà Đam",
            "code": "50507036"
          },
          {
            "name": "Xã Tây Trà Bồng",
            "code": "50507037"
          }
        ]
      },
      {
        "name": "Huyện Tu Mơ Rông",
        "code": "60115",
        "wards": [
          {
            "name": "Xã Đăk Sao",
            "code": "60115071"
          },
          {
            "name": "Xã Đăk Tờ Kan",
            "code": "60115072"
          },
          {
            "name": "Xã Tu Mơ Rông",
            "code": "60115073"
          },
          {
            "name": "Xã Măng Ri",
            "code": "60115074"
          }
        ]
      },
      {
        "name": "Huyện Tư Nghĩa",
        "code": "50515",
        "wards": [
          {
            "name": "Xã Tư Nghĩa",
            "code": "50515020"
          },
          {
            "name": "Xã Vệ Giang",
            "code": "50515021"
          },
          {
            "name": "Xã Nghĩa Giang",
            "code": "50515022"
          },
          {
            "name": "Xã Trà Giang",
            "code": "50515023"
          }
        ]
      },
      {
        "name": "Thành phố Kon Tum",
        "code": "60101",
        "wards": [
          {
            "name": "Phường Kon Tum",
            "code": "60101057"
          },
          {
            "name": "Phường Đăk Cấm",
            "code": "60101058"
          },
          {
            "name": "Phường Đăk BLa",
            "code": "60101059"
          },
          {
            "name": "Xã Ngọk Bay",
            "code": "60101060"
          },
          {
            "name": "Xã Ia Chim",
            "code": "60101061"
          },
          {
            "name": "Xã Đăk Rơ Wa",
            "code": "60101062"
          }
        ]
      },
      {
        "name": "Thành phố Quảng Ngãi",
        "code": "50501",
        "wards": [
          {
            "name": "Xã Tịnh Khê",
            "code": "50501001"
          },
          {
            "name": "Phường Trương Quang Trọng",
            "code": "50501002"
          },
          {
            "name": "Xã An Phú",
            "code": "50501003"
          },
          {
            "name": "Phường Cẩm Thành",
            "code": "50501004"
          },
          {
            "name": "Phường Nghĩa Lộ",
            "code": "50501005"
          }
        ]
      },
      {
        "name": "Thị xã Đức Phổ",
        "code": "50523",
        "wards": [
          {
            "name": "Phường Trà Câu",
            "code": "50523006"
          },
          {
            "name": "Xã Nguyễn Nghiêm",
            "code": "50523007"
          },
          {
            "name": "Phường Đức Phổ",
            "code": "50523008"
          },
          {
            "name": "Xã Khánh Cường",
            "code": "50523009"
          },
          {
            "name": "Phường Sa Huỳnh",
            "code": "50523010"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Quảng Ninh",
    "code": "03",
    "districts": [
      {
        "name": "Huyện Ba Chẽ",
        "code": "22515",
        "wards": [
          {
            "name": "Xã Kỳ Thượng",
            "code": "22515036"
          },
          {
            "name": "Xã Ba Chẽ",
            "code": "22515037"
          }
        ]
      },
      {
        "name": "Huyện Bình Liêu",
        "code": "22507",
        "wards": [
          {
            "name": "Xã Hoành Mô",
            "code": "22507043"
          },
          {
            "name": "Xã Lục Hồn",
            "code": "22507044"
          },
          {
            "name": "Xã Bình Liêu",
            "code": "22507045"
          }
        ]
      },
      {
        "name": "Huyện Cô Tô",
        "code": "22523",
        "wards": [
          {
            "name": "Đặc khu Cô Tô",
            "code": "22523053"
          }
        ]
      },
      {
        "name": "Huyện Đầm Hà",
        "code": "22527",
        "wards": [
          {
            "name": "Xã Quảng Tân",
            "code": "22527038"
          },
          {
            "name": "Xã Đầm Hà",
            "code": "22527039"
          }
        ]
      },
      {
        "name": "Huyện Hải Hà",
        "code": "22511",
        "wards": [
          {
            "name": "Xã Quảng Hà",
            "code": "22511040"
          },
          {
            "name": "Xã Đường Hoa",
            "code": "22511041"
          },
          {
            "name": "Xã Quảng Đức",
            "code": "22511042"
          },
          {
            "name": "Xã Cái Chiên",
            "code": "22511054"
          }
        ]
      },
      {
        "name": "Huyện Tiên Yên",
        "code": "22513",
        "wards": [
          {
            "name": "Xã Tiên Yên",
            "code": "22513031"
          },
          {
            "name": "Xã Điền Xá",
            "code": "22513032"
          },
          {
            "name": "Xã Đông Ngũ",
            "code": "22513033"
          },
          {
            "name": "Xã Hải Lạng",
            "code": "22513034"
          }
        ]
      },
      {
        "name": "Huyện Vân Đồn",
        "code": "22517",
        "wards": [
          {
            "name": "Đặc khu Vân Đồn",
            "code": "22517052"
          }
        ]
      },
      {
        "name": "Thành phố Cẩm Phả",
        "code": "22503",
        "wards": [
          {
            "name": "Phường Mông Dương",
            "code": "22503026"
          },
          {
            "name": "Phường Quang Hanh",
            "code": "22503027"
          },
          {
            "name": "Phường Cẩm Phả",
            "code": "22503028"
          },
          {
            "name": "Phường Cửa Ông",
            "code": "22503029"
          },
          {
            "name": "Xã Hải Hoà",
            "code": "22503030"
          }
        ]
      },
      {
        "name": "Thành phố Đông Triều",
        "code": "22521",
        "wards": [
          {
            "name": "Phường An Sinh",
            "code": "22521001"
          },
          {
            "name": "Phường Đông Triều",
            "code": "22521002"
          },
          {
            "name": "Phường Bình Khê",
            "code": "22521003"
          },
          {
            "name": "Phường Mạo Khê",
            "code": "22521004"
          },
          {
            "name": "Phường Hoàng Quế",
            "code": "22521005"
          }
        ]
      },
      {
        "name": "Thành phố Hạ Long",
        "code": "22501",
        "wards": [
          {
            "name": "Phường Tuần Châu",
            "code": "22501015"
          },
          {
            "name": "Phường Việt Hưng",
            "code": "22501016"
          },
          {
            "name": "Phường Bãi Cháy",
            "code": "22501017"
          },
          {
            "name": "Phường Hà Tu",
            "code": "22501018"
          },
          {
            "name": "Phường Hà Lầm",
            "code": "22501019"
          },
          {
            "name": "Phường Cao Xanh",
            "code": "22501020"
          },
          {
            "name": "Phường Hồng Gai",
            "code": "22501021"
          },
          {
            "name": "Phường Hạ Long",
            "code": "22501022"
          },
          {
            "name": "Phường Hoành Bồ",
            "code": "22501023"
          },
          {
            "name": "Xã Quảng La",
            "code": "22501024"
          },
          {
            "name": "Xã Thống Nhất",
            "code": "22501025"
          },
          {
            "name": "Xã Lương Minh",
            "code": "22501035"
          }
        ]
      },
      {
        "name": "Thành phố Móng Cái",
        "code": "22509",
        "wards": [
          {
            "name": "Xã Hải Sơn",
            "code": "22509046"
          },
          {
            "name": "Xã Hải Ninh",
            "code": "22509047"
          },
          {
            "name": "Xã Vĩnh Thực",
            "code": "22509048"
          },
          {
            "name": "Phường Móng Cái 1",
            "code": "22509049"
          },
          {
            "name": "Phường Móng Cái 2",
            "code": "22509050"
          },
          {
            "name": "Phường Móng Cái 3",
            "code": "22509051"
          }
        ]
      },
      {
        "name": "Thành phố Uông Bí",
        "code": "22505",
        "wards": [
          {
            "name": "Phường Yên Tử",
            "code": "22505006"
          },
          {
            "name": "Phường Vàng Danh",
            "code": "22505007"
          },
          {
            "name": "Phường Uông Bí",
            "code": "22505008"
          }
        ]
      },
      {
        "name": "Thị xã Quảng Yên",
        "code": "22525",
        "wards": [
          {
            "name": "Phường Đông Mai",
            "code": "22525009"
          },
          {
            "name": "Phường Hiệp Hoà",
            "code": "22525010"
          },
          {
            "name": "Phường Quảng Yên",
            "code": "22525011"
          },
          {
            "name": "Phường Hà An",
            "code": "22525012"
          },
          {
            "name": "Phường Phong Cốc",
            "code": "22525013"
          },
          {
            "name": "Phường Liên Hoà",
            "code": "22525014"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Quảng Trị",
    "code": "19",
    "districts": [
      {
        "name": "Huyện Bố Trạch",
        "code": "40709",
        "wards": [
          {
            "name": "Xã Thượng Trạch",
            "code": "40709024"
          },
          {
            "name": "Xã Phong Nha",
            "code": "40709025"
          },
          {
            "name": "Xã Bắc Trạch",
            "code": "40709026"
          },
          {
            "name": "Xã Đông Trạch",
            "code": "40709027"
          },
          {
            "name": "Xã Hoàn Lão",
            "code": "40709028"
          },
          {
            "name": "Xã Bố Trạch",
            "code": "40709029"
          },
          {
            "name": "Xã Nam Trạch",
            "code": "40709030"
          }
        ]
      },
      {
        "name": "Huyện Cam Lộ",
        "code": "40909",
        "wards": [
          {
            "name": "Xã Cam Lộ",
            "code": "40909066"
          },
          {
            "name": "Xã Hiếu Giang",
            "code": "40909067"
          }
        ]
      },
      {
        "name": "Huyện Đa Krông",
        "code": "40917",
        "wards": [
          {
            "name": "Xã La Lay",
            "code": "40917061"
          },
          {
            "name": "Xã Tà Rụt",
            "code": "40917062"
          },
          {
            "name": "Xã Đakrông",
            "code": "40917063"
          },
          {
            "name": "Xã Ba Lòng",
            "code": "40917064"
          },
          {
            "name": "Xã Hướng Hiệp",
            "code": "40917065"
          }
        ]
      },
      {
        "name": "Huyện Đảo Cồn Cỏ",
        "code": "40919",
        "wards": [
          {
            "name": "Đặc khu Cồn Cỏ",
            "code": "40919078"
          }
        ]
      },
      {
        "name": "Huyện Gio Linh",
        "code": "40907",
        "wards": [
          {
            "name": "Xã Cồn Tiên",
            "code": "40907050"
          },
          {
            "name": "Xã Cửa Việt",
            "code": "40907051"
          },
          {
            "name": "Xã Gio Linh",
            "code": "40907052"
          },
          {
            "name": "Xã Bến Hải",
            "code": "40907053"
          }
        ]
      },
      {
        "name": "Huyện Hải Lăng",
        "code": "40913",
        "wards": [
          {
            "name": "Xã Diên Sanh",
            "code": "40913073"
          },
          {
            "name": "Xã Mỹ Thủy",
            "code": "40913074"
          },
          {
            "name": "Xã Hải Lăng",
            "code": "40913075"
          },
          {
            "name": "Xã Vĩnh Định",
            "code": "40913076"
          },
          {
            "name": "Xã Nam Hải Lăng",
            "code": "40913077"
          }
        ]
      },
      {
        "name": "Huyện Hướng Hoá",
        "code": "40915",
        "wards": [
          {
            "name": "Xã Hướng Lập",
            "code": "40915054"
          },
          {
            "name": "Xã Hướng Phùng",
            "code": "40915055"
          },
          {
            "name": "Xã Khe Sanh",
            "code": "40915056"
          },
          {
            "name": "Xã Tân Lập",
            "code": "40915057"
          },
          {
            "name": "Xã Lao Bảo",
            "code": "40915058"
          },
          {
            "name": "Xã Lìa",
            "code": "40915059"
          },
          {
            "name": "Xã A Dơi",
            "code": "40915060"
          }
        ]
      },
      {
        "name": "Huyện Lệ Thuỷ",
        "code": "40713",
        "wards": [
          {
            "name": "Xã Lệ Thủy",
            "code": "40713035"
          },
          {
            "name": "Xã Cam Hồng",
            "code": "40713036"
          },
          {
            "name": "Xã Sen Ngư",
            "code": "40713037"
          },
          {
            "name": "Xã Tân Mỹ",
            "code": "40713038"
          },
          {
            "name": "Xã Trường Phú",
            "code": "40713039"
          },
          {
            "name": "Xã Lệ Ninh",
            "code": "40713040"
          },
          {
            "name": "Xã Kim Ngân",
            "code": "40713041"
          }
        ]
      },
      {
        "name": "Huyện Minh Hoá",
        "code": "40705",
        "wards": [
          {
            "name": "Xã Dân Hóa",
            "code": "40705008"
          },
          {
            "name": "Xã Kim Điền",
            "code": "40705009"
          },
          {
            "name": "Xã Kim Phú",
            "code": "40705010"
          },
          {
            "name": "Xã Minh Hóa",
            "code": "40705011"
          },
          {
            "name": "Xã Tân Thành",
            "code": "40705012"
          }
        ]
      },
      {
        "name": "Huyện Quảng Ninh",
        "code": "40711",
        "wards": [
          {
            "name": "Xã Quảng Ninh",
            "code": "40711031"
          },
          {
            "name": "Xã Ninh Châu",
            "code": "40711032"
          },
          {
            "name": "Xã Trường Ninh",
            "code": "40711033"
          },
          {
            "name": "Xã Trường Sơn",
            "code": "40711034"
          }
        ]
      },
      {
        "name": "Huyện Quảng Trạch",
        "code": "40707",
        "wards": [
          {
            "name": "Xã Tân Gianh",
            "code": "40707019"
          },
          {
            "name": "Xã Trung Thuần",
            "code": "40707020"
          },
          {
            "name": "Xã Quảng Trạch",
            "code": "40707021"
          },
          {
            "name": "Xã Hoà Trạch",
            "code": "40707022"
          },
          {
            "name": "Xã Phú Trạch",
            "code": "40707023"
          }
        ]
      },
      {
        "name": "Huyện Triệu Phong",
        "code": "40911",
        "wards": [
          {
            "name": "Xã Triệu Phong",
            "code": "40911068"
          },
          {
            "name": "Xã Ái Tử",
            "code": "40911069"
          },
          {
            "name": "Xã Triệu Bình",
            "code": "40911070"
          },
          {
            "name": "Xã Triệu Cơ",
            "code": "40911071"
          },
          {
            "name": "Xã Nam Cửa Việt",
            "code": "40911072"
          }
        ]
      },
      {
        "name": "Huyện Tuyên Hoá",
        "code": "40703",
        "wards": [
          {
            "name": "Xã Tuyên Lâm",
            "code": "40703013"
          },
          {
            "name": "Xã Tuyên Sơn",
            "code": "40703014"
          },
          {
            "name": "Xã Đồng Lê",
            "code": "40703015"
          },
          {
            "name": "Xã Tuyên Phú",
            "code": "40703016"
          },
          {
            "name": "Xã Tuyên Bình",
            "code": "40703017"
          },
          {
            "name": "Xã Tuyên Hóa",
            "code": "40703018"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Linh",
        "code": "40905",
        "wards": [
          {
            "name": "Xã Vĩnh Linh",
            "code": "40905045"
          },
          {
            "name": "Xã Cửa Tùng",
            "code": "40905046"
          },
          {
            "name": "Xã Vĩnh Hoàng",
            "code": "40905047"
          },
          {
            "name": "Xã Vĩnh Thủy",
            "code": "40905048"
          },
          {
            "name": "Xã Bến Quan",
            "code": "40905049"
          }
        ]
      },
      {
        "name": "Thành phố Đông Hà",
        "code": "40901",
        "wards": [
          {
            "name": "Phường Đông Hà",
            "code": "40901042"
          },
          {
            "name": "Phường Nam Đông Hà",
            "code": "40901043"
          }
        ]
      },
      {
        "name": "Thành phố Đồng Hới",
        "code": "40701",
        "wards": [
          {
            "name": "Phường Đồng Hới",
            "code": "40701001"
          },
          {
            "name": "Phường Đồng Thuận",
            "code": "40701002"
          },
          {
            "name": "Phường Đồng Sơn",
            "code": "40701003"
          }
        ]
      },
      {
        "name": "Thị xã Ba Đồn",
        "code": "40715",
        "wards": [
          {
            "name": "Xã Nam Gianh",
            "code": "40715004"
          },
          {
            "name": "Xã Nam Ba Đồn",
            "code": "40715005"
          },
          {
            "name": "Phường Ba Đồn",
            "code": "40715006"
          },
          {
            "name": "Phường Bắc Gianh",
            "code": "40715007"
          }
        ]
      },
      {
        "name": "Thị xã Quảng Trị",
        "code": "40903",
        "wards": [
          {
            "name": "Phường Quảng Trị",
            "code": "40903044"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Sơn La",
    "code": "15",
    "districts": [
      {
        "name": "Huyện Bắc Yên",
        "code": "30309",
        "wards": [
          {
            "name": "Xã Bắc Yên",
            "code": "30309033"
          },
          {
            "name": "Xã Tà Xùa",
            "code": "30309034"
          },
          {
            "name": "Xã Tạ Khoa",
            "code": "30309035"
          },
          {
            "name": "Xã Xím Vàng",
            "code": "30309036"
          },
          {
            "name": "Xã Pắc Ngà",
            "code": "30309037"
          },
          {
            "name": "Xã Chiềng Sại",
            "code": "30309038"
          }
        ]
      },
      {
        "name": "Huyện Mai Sơn",
        "code": "30313",
        "wards": [
          {
            "name": "Xã Chiềng Mai",
            "code": "30313050"
          },
          {
            "name": "Xã Mai Sơn",
            "code": "30313051"
          },
          {
            "name": "Xã Phiêng Pằn",
            "code": "30313052"
          },
          {
            "name": "Xã Chiềng Mung",
            "code": "30313053"
          },
          {
            "name": "Xã Phiêng Cằm",
            "code": "30313054"
          },
          {
            "name": "Xã Mường Chanh",
            "code": "30313055"
          },
          {
            "name": "Xã Tà Hộc",
            "code": "30313056"
          },
          {
            "name": "Xã Chiềng Sung",
            "code": "30313057"
          }
        ]
      },
      {
        "name": "Huyện Mường La",
        "code": "30305",
        "wards": [
          {
            "name": "Xã Mường La",
            "code": "30305029"
          },
          {
            "name": "Xã Chiềng Lao",
            "code": "30305030"
          },
          {
            "name": "Xã Mường Bú",
            "code": "30305031"
          },
          {
            "name": "Xã Chiềng Hoa",
            "code": "30305032"
          },
          {
            "name": "Xã Ngọc Chiến",
            "code": "30305071"
          }
        ]
      },
      {
        "name": "Huyện Phù Yên",
        "code": "30311",
        "wards": [
          {
            "name": "Xã Phù Yên",
            "code": "30311039"
          },
          {
            "name": "Xã Gia Phù",
            "code": "30311040"
          },
          {
            "name": "Xã Tường Hạ",
            "code": "30311041"
          },
          {
            "name": "Xã Mường Cơi",
            "code": "30311042"
          },
          {
            "name": "Xã Mường Bang",
            "code": "30311043"
          },
          {
            "name": "Xã Tân Phong",
            "code": "30311044"
          },
          {
            "name": "Xã Kim Bon",
            "code": "30311045"
          },
          {
            "name": "Xã Suối Tọ",
            "code": "30311072"
          }
        ]
      },
      {
        "name": "Huyện Quỳnh Nhai",
        "code": "30303",
        "wards": [
          {
            "name": "Xã Quỳnh Nhai",
            "code": "30303016"
          },
          {
            "name": "Xã Mường Chiên",
            "code": "30303017"
          },
          {
            "name": "Xã Mường Giôn",
            "code": "30303018"
          },
          {
            "name": "Xã Mường Sại",
            "code": "30303019"
          }
        ]
      },
      {
        "name": "Huyện Sông Mã",
        "code": "30315",
        "wards": [
          {
            "name": "Xã Bó Sinh",
            "code": "30315058"
          },
          {
            "name": "Xã Chiềng Khương",
            "code": "30315059"
          },
          {
            "name": "Xã Mường Hung",
            "code": "30315060"
          },
          {
            "name": "Xã Chiềng Khoong",
            "code": "30315061"
          },
          {
            "name": "Xã Mường Lầm",
            "code": "30315062"
          },
          {
            "name": "Xã Nậm Ty",
            "code": "30315063"
          },
          {
            "name": "Xã Sông Mã",
            "code": "30315064"
          },
          {
            "name": "Xã Huổi Một",
            "code": "30315065"
          },
          {
            "name": "Xã Chiềng Sơ",
            "code": "30315066"
          }
        ]
      },
      {
        "name": "Huyện Sốp Cộp",
        "code": "30321",
        "wards": [
          {
            "name": "Xã Sốp Cộp",
            "code": "30321067"
          },
          {
            "name": "Xã Púng Bánh",
            "code": "30321068"
          },
          {
            "name": "Xã Mường Lạn",
            "code": "30321074"
          },
          {
            "name": "Xã Mường Lèo",
            "code": "30321075"
          }
        ]
      },
      {
        "name": "Huyện Thuận Châu",
        "code": "30307",
        "wards": [
          {
            "name": "Xã Thuận Châu",
            "code": "30307020"
          },
          {
            "name": "Xã Chiềng La",
            "code": "30307021"
          },
          {
            "name": "Xã Nậm Lầu",
            "code": "30307022"
          },
          {
            "name": "Xã Muổi Nọi",
            "code": "30307023"
          },
          {
            "name": "Xã Mường Khiêng",
            "code": "30307024"
          },
          {
            "name": "Xã Co Mạ",
            "code": "30307025"
          },
          {
            "name": "Xã Bình Thuận",
            "code": "30307026"
          },
          {
            "name": "Xã Mường É",
            "code": "30307027"
          },
          {
            "name": "Xã Long Hẹ",
            "code": "30307028"
          },
          {
            "name": "Xã Mường Bám",
            "code": "30307070"
          }
        ]
      },
      {
        "name": "Huyện Vân Hồ",
        "code": "30323",
        "wards": [
          {
            "name": "Xã Vân Hồ",
            "code": "30323012"
          },
          {
            "name": "Xã Song Khủa",
            "code": "30323013"
          },
          {
            "name": "Xã Tô Múa",
            "code": "30323014"
          },
          {
            "name": "Xã Xuân Nha",
            "code": "30323015"
          }
        ]
      },
      {
        "name": "Huyện Yên Châu",
        "code": "30317",
        "wards": [
          {
            "name": "Xã Yên Châu",
            "code": "30317046"
          },
          {
            "name": "Xã Chiềng Hặc",
            "code": "30317047"
          },
          {
            "name": "Xã Lóng Phiêng",
            "code": "30317048"
          },
          {
            "name": "Xã Yên Sơn",
            "code": "30317049"
          },
          {
            "name": "Xã Phiêng Khoài",
            "code": "30317073"
          }
        ]
      },
      {
        "name": "Thành phố Sơn La",
        "code": "30301",
        "wards": [
          {
            "name": "Phường Tô Hiệu",
            "code": "30301001"
          },
          {
            "name": "Phường Chiềng An",
            "code": "30301002"
          },
          {
            "name": "Phường Chiềng Cơi",
            "code": "30301003"
          },
          {
            "name": "Phường Chiềng Sinh",
            "code": "30301004"
          }
        ]
      },
      {
        "name": "Thị xã Mộc Châu",
        "code": "30319",
        "wards": [
          {
            "name": "Phường Mộc Châu",
            "code": "30319005"
          },
          {
            "name": "Phường Mộc Sơn",
            "code": "30319006"
          },
          {
            "name": "Phường Vân Sơn",
            "code": "30319007"
          },
          {
            "name": "Phường Thảo Nguyên",
            "code": "30319008"
          },
          {
            "name": "Xã Đoàn Kết",
            "code": "30319009"
          },
          {
            "name": "Xã Lóng Sập",
            "code": "30319010"
          },
          {
            "name": "Xã Chiềng Sơn",
            "code": "30319011"
          },
          {
            "name": "Xã Tân Yên",
            "code": "30319069"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Tây Ninh",
    "code": "27",
    "districts": [
      {
        "name": "Huyện Bến Cầu",
        "code": "70913",
        "wards": [
          {
            "name": "Xã Long Chữ",
            "code": "70913094"
          },
          {
            "name": "Xã Long Thuận",
            "code": "70913095"
          },
          {
            "name": "Xã Bến Cầu",
            "code": "70913096"
          }
        ]
      },
      {
        "name": "Huyện Bến Lức",
        "code": "80117",
        "wards": [
          {
            "name": "Xã Thạnh Lợi",
            "code": "80117035"
          },
          {
            "name": "Xã Bình Đức",
            "code": "80117036"
          },
          {
            "name": "Xã Lương Hoà",
            "code": "80117037"
          },
          {
            "name": "Xã Bến Lức",
            "code": "80117038"
          },
          {
            "name": "Xã Mỹ Yên",
            "code": "80117039"
          }
        ]
      },
      {
        "name": "Huyện Cần Đước",
        "code": "80125",
        "wards": [
          {
            "name": "Xã Long Cang",
            "code": "80125040"
          },
          {
            "name": "Xã Rạch Kiến",
            "code": "80125041"
          },
          {
            "name": "Xã Mỹ Lệ",
            "code": "80125042"
          },
          {
            "name": "Xã Tân Lân",
            "code": "80125043"
          },
          {
            "name": "Xã Cần Đước",
            "code": "80125044"
          },
          {
            "name": "Xã Long Hựu",
            "code": "80125045"
          }
        ]
      },
      {
        "name": "Huyện Cần Giuộc",
        "code": "80127",
        "wards": [
          {
            "name": "Xã Phước Lý",
            "code": "80127046"
          },
          {
            "name": "Xã Mỹ Lộc",
            "code": "80127047"
          },
          {
            "name": "Xã Cần Giuộc",
            "code": "80127048"
          },
          {
            "name": "Xã Phước Vĩnh Tây",
            "code": "80127049"
          },
          {
            "name": "Xã Tân Tập",
            "code": "80127050"
          }
        ]
      },
      {
        "name": "Huyện Châu Thành",
        "code": "80121",
        "wards": [
          {
            "name": "Xã Thuận Mỹ",
            "code": "80121054"
          },
          {
            "name": "Xã An Lục Long",
            "code": "80121055"
          },
          {
            "name": "Xã Tầm Vu",
            "code": "80121056"
          },
          {
            "name": "Xã Vĩnh Công",
            "code": "80121057"
          },
          {
            "name": "Xã Phước Vinh",
            "code": "70909089"
          },
          {
            "name": "Xã Hoà Hội",
            "code": "70909090"
          },
          {
            "name": "Xã Ninh Điền",
            "code": "70909091"
          },
          {
            "name": "Xã Châu Thành",
            "code": "70909092"
          },
          {
            "name": "Xã Hảo Đước",
            "code": "70909093"
          }
        ]
      },
      {
        "name": "Huyện Dương Minh Châu",
        "code": "70907",
        "wards": [
          {
            "name": "Phường Ninh Thạnh",
            "code": "70907063"
          },
          {
            "name": "Xã Lộc Ninh",
            "code": "70907076"
          },
          {
            "name": "Xã Cầu Khởi",
            "code": "70907077"
          },
          {
            "name": "Xã Dương Minh Châu",
            "code": "70907078"
          }
        ]
      },
      {
        "name": "Huyện Đức Hoà",
        "code": "80115",
        "wards": [
          {
            "name": "Xã An Ninh",
            "code": "80115028"
          },
          {
            "name": "Xã Hiệp Hoà",
            "code": "80115029"
          },
          {
            "name": "Xã Hậu Nghĩa",
            "code": "80115030"
          },
          {
            "name": "Xã Hoà Khánh",
            "code": "80115031"
          },
          {
            "name": "Xã Đức Lập",
            "code": "80115032"
          },
          {
            "name": "Xã Mỹ Hạnh",
            "code": "80115033"
          },
          {
            "name": "Xã Đức Hoà",
            "code": "80115034"
          }
        ]
      },
      {
        "name": "Huyện Đức Huệ",
        "code": "80113",
        "wards": [
          {
            "name": "Xã Mỹ Quý",
            "code": "80113025"
          },
          {
            "name": "Xã Đông Thành",
            "code": "80113026"
          },
          {
            "name": "Xã Đức Huệ",
            "code": "80113027"
          }
        ]
      },
      {
        "name": "Huyện Gò Dầu",
        "code": "70915",
        "wards": [
          {
            "name": "Phường Gò Dầu",
            "code": "70915069"
          },
          {
            "name": "Phường Gia Lộc",
            "code": "70915070"
          },
          {
            "name": "Xã Thạnh Đức",
            "code": "70915073"
          },
          {
            "name": "Xã Phước Thạnh",
            "code": "70915074"
          },
          {
            "name": "Xã Truông Mít",
            "code": "70915075"
          }
        ]
      },
      {
        "name": "Huyện Mộc Hoá",
        "code": "80107",
        "wards": [
          {
            "name": "Xã Bình Hoà",
            "code": "80107011"
          },
          {
            "name": "Xã Mộc Hoá",
            "code": "80107012"
          }
        ]
      },
      {
        "name": "Huyện Tân Biên",
        "code": "70903",
        "wards": [
          {
            "name": "Xã Tân Lập",
            "code": "70903085"
          },
          {
            "name": "Xã Tân Biên",
            "code": "70903086"
          },
          {
            "name": "Xã Thạnh Bình",
            "code": "70903087"
          },
          {
            "name": "Xã Trà Vong",
            "code": "70903088"
          }
        ]
      },
      {
        "name": "Huyện Tân Châu",
        "code": "70905",
        "wards": [
          {
            "name": "Xã Tân Đông",
            "code": "70905079"
          },
          {
            "name": "Xã Tân Châu",
            "code": "70905080"
          },
          {
            "name": "Xã Tân Phú",
            "code": "70905081"
          },
          {
            "name": "Xã Tân Hội",
            "code": "70905082"
          },
          {
            "name": "Xã Tân Thành",
            "code": "70905083"
          },
          {
            "name": "Xã Tân Hoà",
            "code": "70905084"
          }
        ]
      },
      {
        "name": "Huyện Tân Hưng",
        "code": "80103",
        "wards": [
          {
            "name": "Xã Hưng Điền",
            "code": "80103001"
          },
          {
            "name": "Xã Vĩnh Thạnh",
            "code": "80103002"
          },
          {
            "name": "Xã Tân Hưng",
            "code": "80103003"
          },
          {
            "name": "Xã Vĩnh Châu",
            "code": "80103004"
          }
        ]
      },
      {
        "name": "Huyện Tân Thạnh",
        "code": "80109",
        "wards": [
          {
            "name": "Xã Hậu Thạnh",
            "code": "80109013"
          },
          {
            "name": "Xã Nhơn Hoà Lập",
            "code": "80109014"
          },
          {
            "name": "Xã Nhơn Ninh",
            "code": "80109015"
          },
          {
            "name": "Xã Tân Thạnh",
            "code": "80109016"
          }
        ]
      },
      {
        "name": "Huyện Tân Trụ",
        "code": "80123",
        "wards": [
          {
            "name": "Xã Vàm Cỏ",
            "code": "80123051"
          },
          {
            "name": "Xã Tân Trụ",
            "code": "80123052"
          },
          {
            "name": "Xã Nhựt Tảo",
            "code": "80123053"
          }
        ]
      },
      {
        "name": "Huyện Thạnh Hoá",
        "code": "80111",
        "wards": [
          {
            "name": "Xã Bình Thành",
            "code": "80111017"
          },
          {
            "name": "Xã Thạnh Phước",
            "code": "80111018"
          },
          {
            "name": "Xã Thạnh Hóa",
            "code": "80111019"
          },
          {
            "name": "Xã Tân Tây",
            "code": "80111020"
          }
        ]
      },
      {
        "name": "Huyện Thủ Thừa",
        "code": "80119",
        "wards": [
          {
            "name": "Xã Thủ Thừa",
            "code": "80119021"
          },
          {
            "name": "Xã Mỹ An",
            "code": "80119022"
          },
          {
            "name": "Xã Mỹ Thạnh",
            "code": "80119023"
          },
          {
            "name": "Xã Tân Long",
            "code": "80119024"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Hưng",
        "code": "80105",
        "wards": [
          {
            "name": "Xã Tuyên Bình",
            "code": "80105005"
          },
          {
            "name": "Xã Vĩnh Hưng",
            "code": "80105006"
          },
          {
            "name": "Xã Khánh Hưng",
            "code": "80105007"
          }
        ]
      },
      {
        "name": "Thành phố Tân An",
        "code": "80101",
        "wards": [
          {
            "name": "Phường Long An",
            "code": "80101058"
          },
          {
            "name": "Phường Tân An",
            "code": "80101059"
          },
          {
            "name": "Phường Khánh Hậu",
            "code": "80101060"
          }
        ]
      },
      {
        "name": "Thành phố Tây Ninh",
        "code": "70901",
        "wards": [
          {
            "name": "Phường Tân Ninh",
            "code": "70901061"
          },
          {
            "name": "Phường Bình Minh",
            "code": "70901062"
          }
        ]
      },
      {
        "name": "Thị xã Hoà Thành",
        "code": "70911",
        "wards": [
          {
            "name": "Phường Long Hoa",
            "code": "70911064"
          },
          {
            "name": "Phường Hoà Thành",
            "code": "70911065"
          },
          {
            "name": "Phường Thanh Điền",
            "code": "70911066"
          }
        ]
      },
      {
        "name": "Thị xã Kiến Tường",
        "code": "80129",
        "wards": [
          {
            "name": "Xã Tuyên Thạnh",
            "code": "80129008"
          },
          {
            "name": "Xã Bình Hiệp",
            "code": "80129009"
          },
          {
            "name": "Phường Kiến Tường",
            "code": "80129010"
          }
        ]
      },
      {
        "name": "Thị xã Trảng Bàng",
        "code": "70917",
        "wards": [
          {
            "name": "Phường Trảng Bàng",
            "code": "70917067"
          },
          {
            "name": "Phường An Tịnh",
            "code": "70917068"
          },
          {
            "name": "Xã Hưng Thuận",
            "code": "70917071"
          },
          {
            "name": "Xã Phước Chỉ",
            "code": "70917072"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Thái Nguyên",
    "code": "10",
    "districts": [
      {
        "name": "Huyện Ba Bể",
        "code": "20703",
        "wards": [
          {
            "name": "Xã Ba Bể",
            "code": "20703058"
          },
          {
            "name": "Xã Chợ Rã",
            "code": "20703059"
          },
          {
            "name": "Xã Phúc Lộc",
            "code": "20703060"
          },
          {
            "name": "Xã Thượng Minh",
            "code": "20703061"
          },
          {
            "name": "Xã Đồng Phúc",
            "code": "20703062"
          }
        ]
      },
      {
        "name": "Huyện Bạch Thông",
        "code": "20711",
        "wards": [
          {
            "name": "Xã Phủ Thông",
            "code": "20711074"
          },
          {
            "name": "Xã Cẩm Giàng",
            "code": "20711075"
          },
          {
            "name": "Xã Vĩnh Thông",
            "code": "20711076"
          },
          {
            "name": "Xã Bạch Thông",
            "code": "20711077"
          }
        ]
      },
      {
        "name": "Huyện Chợ Đồn",
        "code": "20707",
        "wards": [
          {
            "name": "Xã Nam Cường",
            "code": "20707068"
          },
          {
            "name": "Xã Quảng Bạch",
            "code": "20707069"
          },
          {
            "name": "Xã Yên Thịnh",
            "code": "20707070"
          },
          {
            "name": "Xã Chợ Đồn",
            "code": "20707071"
          },
          {
            "name": "Xã Yên Phong",
            "code": "20707072"
          },
          {
            "name": "Xã Nghĩa Tá",
            "code": "20707073"
          }
        ]
      },
      {
        "name": "Huyện Chợ Mới",
        "code": "20713",
        "wards": [
          {
            "name": "Xã Yên Bình",
            "code": "20713063"
          },
          {
            "name": "Xã Tân Kỳ",
            "code": "20713087"
          },
          {
            "name": "Xã Thanh Mai",
            "code": "20713088"
          },
          {
            "name": "Xã Thanh Thịnh",
            "code": "20713089"
          },
          {
            "name": "Xã Chợ Mới",
            "code": "20713090"
          }
        ]
      },
      {
        "name": "Huyện Đại Từ",
        "code": "21513",
        "wards": [
          {
            "name": "Xã Đại Từ",
            "code": "21513009"
          },
          {
            "name": "Xã Đức Lương",
            "code": "21513010"
          },
          {
            "name": "Xã Phú Thịnh",
            "code": "21513011"
          },
          {
            "name": "Xã La Bằng",
            "code": "21513012"
          },
          {
            "name": "Xã Phú Lạc",
            "code": "21513013"
          },
          {
            "name": "Xã An Khánh",
            "code": "21513014"
          },
          {
            "name": "Xã Quân Chu",
            "code": "21513015"
          },
          {
            "name": "Xã Vạn Phú",
            "code": "21513016"
          },
          {
            "name": "Xã Phú Xuyên",
            "code": "21513017"
          }
        ]
      },
      {
        "name": "Huyện Định Hoá",
        "code": "21505",
        "wards": [
          {
            "name": "Xã Định Hóa",
            "code": "21505041"
          },
          {
            "name": "Xã Bình Yên",
            "code": "21505042"
          },
          {
            "name": "Xã Trung Hội",
            "code": "21505043"
          },
          {
            "name": "Xã Phượng Tiến",
            "code": "21505044"
          },
          {
            "name": "Xã Phú Đình",
            "code": "21505045"
          },
          {
            "name": "Xã Bình Thành",
            "code": "21505046"
          },
          {
            "name": "Xã Kim Phượng",
            "code": "21505047"
          },
          {
            "name": "Xã Lam Vỹ",
            "code": "21505048"
          }
        ]
      },
      {
        "name": "Huyện Đồng Hỷ",
        "code": "21511",
        "wards": [
          {
            "name": "Xã Đồng Hỷ",
            "code": "21511028"
          },
          {
            "name": "Xã Quang Sơn",
            "code": "21511029"
          },
          {
            "name": "Xã Trại Cau",
            "code": "21511030"
          },
          {
            "name": "Xã Nam Hoà",
            "code": "21511031"
          },
          {
            "name": "Xã Văn Hán",
            "code": "21511032"
          },
          {
            "name": "Xã Văn Lăng",
            "code": "21511033"
          }
        ]
      },
      {
        "name": "Huyện Na Rì",
        "code": "20709",
        "wards": [
          {
            "name": "Xã Văn Lang",
            "code": "20709081"
          },
          {
            "name": "Xã Cường Lợi",
            "code": "20709082"
          },
          {
            "name": "Xã Na Rì",
            "code": "20709083"
          },
          {
            "name": "Xã Trần Phú",
            "code": "20709084"
          },
          {
            "name": "Xã Côn Minh",
            "code": "20709085"
          },
          {
            "name": "Xã Xuân Dương",
            "code": "20709086"
          }
        ]
      },
      {
        "name": "Huyện Ngân Sơn",
        "code": "20705",
        "wards": [
          {
            "name": "Xã Bằng Vân",
            "code": "20705064"
          },
          {
            "name": "Xã Ngân Sơn",
            "code": "20705065"
          },
          {
            "name": "Xã Nà Phặc",
            "code": "20705066"
          },
          {
            "name": "Xã Hiệp Lực",
            "code": "20705067"
          },
          {
            "name": "Xã Thượng Quan",
            "code": "20705092"
          }
        ]
      },
      {
        "name": "Huyện Pác Nặm",
        "code": "20704",
        "wards": [
          {
            "name": "Xã Bằng Thành",
            "code": "20704055"
          },
          {
            "name": "Xã Nghiên Loan",
            "code": "20704056"
          },
          {
            "name": "Xã Cao Minh",
            "code": "20704057"
          }
        ]
      },
      {
        "name": "Huyện Phú Bình",
        "code": "21515",
        "wards": [
          {
            "name": "Xã Phú Bình",
            "code": "21515023"
          },
          {
            "name": "Xã Tân Thành",
            "code": "21515024"
          },
          {
            "name": "Xã Điềm Thụy",
            "code": "21515025"
          },
          {
            "name": "Xã Kha Sơn",
            "code": "21515026"
          },
          {
            "name": "Xã Tân Khánh",
            "code": "21515027"
          }
        ]
      },
      {
        "name": "Huyện Phú Lương",
        "code": "21509",
        "wards": [
          {
            "name": "Xã Phú Lương",
            "code": "21509037"
          },
          {
            "name": "Xã Vô Tranh",
            "code": "21509038"
          },
          {
            "name": "Xã Yên Trạch",
            "code": "21509039"
          },
          {
            "name": "Xã Hợp Thành",
            "code": "21509040"
          }
        ]
      },
      {
        "name": "Huyện Võ Nhai",
        "code": "21507",
        "wards": [
          {
            "name": "Xã Võ Nhai",
            "code": "21507049"
          },
          {
            "name": "Xã Dân Tiến",
            "code": "21507050"
          },
          {
            "name": "Xã Nghinh Tường",
            "code": "21507051"
          },
          {
            "name": "Xã Thần Sa",
            "code": "21507052"
          },
          {
            "name": "Xã La Hiên",
            "code": "21507053"
          },
          {
            "name": "Xã Tràng Xá",
            "code": "21507054"
          },
          {
            "name": "Xã Sảng Mộc",
            "code": "21507091"
          }
        ]
      },
      {
        "name": "Thành phố Bắc Kạn",
        "code": "20701",
        "wards": [
          {
            "name": "Xã Phong Quang",
            "code": "20701078"
          },
          {
            "name": "Phường Đức Xuân",
            "code": "20701079"
          },
          {
            "name": "Phường Bắc Kạn",
            "code": "20701080"
          }
        ]
      },
      {
        "name": "Thành phố Phổ Yên",
        "code": "21517",
        "wards": [
          {
            "name": "Phường Phổ Yên",
            "code": "21517018"
          },
          {
            "name": "Phường Vạn Xuân",
            "code": "21517019"
          },
          {
            "name": "Phường Trung Thành",
            "code": "21517020"
          },
          {
            "name": "Phường Phúc Thuận",
            "code": "21517021"
          },
          {
            "name": "Xã Thành Công",
            "code": "21517022"
          }
        ]
      },
      {
        "name": "Thành phố Sông Công",
        "code": "21503",
        "wards": [
          {
            "name": "Phường Sông Công",
            "code": "21503034"
          },
          {
            "name": "Phường Bá Xuyên",
            "code": "21503035"
          },
          {
            "name": "Phường Bách Quang",
            "code": "21503036"
          }
        ]
      },
      {
        "name": "Thành phố Thái Nguyên",
        "code": "21501",
        "wards": [
          {
            "name": "Phường Phan Đình Phùng",
            "code": "21501001"
          },
          {
            "name": "Phường Linh Sơn",
            "code": "21501002"
          },
          {
            "name": "Phường Tích Lương",
            "code": "21501003"
          },
          {
            "name": "Phường Gia Sàng",
            "code": "21501004"
          },
          {
            "name": "Phường Quyết Thắng",
            "code": "21501005"
          },
          {
            "name": "Phường Quan Triều",
            "code": "21501006"
          },
          {
            "name": "Xã Tân Cương",
            "code": "21501007"
          },
          {
            "name": "Xã Đại Phúc",
            "code": "21501008"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Thanh Hóa",
    "code": "16",
    "districts": [
      {
        "name": "Huyện Bá Thước",
        "code": "40113",
        "wards": [
          {
            "name": "Xã Văn Nho",
            "code": "40113121"
          },
          {
            "name": "Xã Thiết Ống",
            "code": "40113122"
          },
          {
            "name": "Xã Bá Thước",
            "code": "40113123"
          },
          {
            "name": "Xã Cổ Lũng",
            "code": "40113124"
          },
          {
            "name": "Xã Pù Luông",
            "code": "40113125"
          },
          {
            "name": "Xã Điền Lư",
            "code": "40113126"
          },
          {
            "name": "Xã Điền Quang",
            "code": "40113127"
          },
          {
            "name": "Xã Quý Lương",
            "code": "40113128"
          }
        ]
      },
      {
        "name": "Huyện Cẩm Thuỷ",
        "code": "40115",
        "wards": [
          {
            "name": "Xã Cẩm Thạch",
            "code": "40115135"
          },
          {
            "name": "Xã Cẩm Thủy",
            "code": "40115136"
          },
          {
            "name": "Xã Cẩm Tú",
            "code": "40115137"
          },
          {
            "name": "Xã Cẩm Vân",
            "code": "40115138"
          },
          {
            "name": "Xã Cẩm Tân",
            "code": "40115139"
          }
        ]
      },
      {
        "name": "Huyện Hà Trung",
        "code": "40131",
        "wards": [
          {
            "name": "Xã Hà Trung",
            "code": "40131022"
          },
          {
            "name": "Xã Tống Sơn",
            "code": "40131023"
          },
          {
            "name": "Xã Hà Long",
            "code": "40131024"
          },
          {
            "name": "Xã Hoạt Giang",
            "code": "40131025"
          },
          {
            "name": "Xã Lĩnh Toại",
            "code": "40131026"
          }
        ]
      },
      {
        "name": "Huyện Hậu Lộc",
        "code": "40139",
        "wards": [
          {
            "name": "Xã Triệu Lộc",
            "code": "40139027"
          },
          {
            "name": "Xã Đông Thành",
            "code": "40139028"
          },
          {
            "name": "Xã Hậu Lộc",
            "code": "40139029"
          },
          {
            "name": "Xã Hoa Lộc",
            "code": "40139030"
          },
          {
            "name": "Xã Vạn Lộc",
            "code": "40139031"
          }
        ]
      },
      {
        "name": "Huyện Hoằng Hoá",
        "code": "40143",
        "wards": [
          {
            "name": "Xã Hoằng Hóa",
            "code": "40143038"
          },
          {
            "name": "Xã Hoằng Tiến",
            "code": "40143039"
          },
          {
            "name": "Xã Hoằng Thanh",
            "code": "40143040"
          },
          {
            "name": "Xã Hoằng Lộc",
            "code": "40143041"
          },
          {
            "name": "Xã Hoằng Châu",
            "code": "40143042"
          },
          {
            "name": "Xã Hoằng Sơn",
            "code": "40143043"
          },
          {
            "name": "Xã Hoằng Phú",
            "code": "40143044"
          },
          {
            "name": "Xã Hoằng Giang",
            "code": "40143045"
          }
        ]
      },
      {
        "name": "Huyện Lang Chánh",
        "code": "40117",
        "wards": [
          {
            "name": "Xã Linh Sơn",
            "code": "40117115"
          },
          {
            "name": "Xã Đồng Lương",
            "code": "40117116"
          },
          {
            "name": "Xã Văn Phú",
            "code": "40117117"
          },
          {
            "name": "Xã Giao An",
            "code": "40117118"
          },
          {
            "name": "Xã Yên Khương",
            "code": "40117119"
          },
          {
            "name": "Xã Yên Thắng",
            "code": "40117120"
          }
        ]
      },
      {
        "name": "Huyện Mường Lát",
        "code": "40107",
        "wards": [
          {
            "name": "Xã Mường Chanh",
            "code": "40107091"
          },
          {
            "name": "Xã Quang Chiểu",
            "code": "40107092"
          },
          {
            "name": "Xã Tam chung",
            "code": "40107093"
          },
          {
            "name": "Xã Mường Lát",
            "code": "40107094"
          },
          {
            "name": "Xã Pù Nhi",
            "code": "40107095"
          },
          {
            "name": "Xã Nhi Sơn",
            "code": "40107096"
          },
          {
            "name": "Xã Mường Lý",
            "code": "40107097"
          },
          {
            "name": "Xã Trung Lý",
            "code": "40107098"
          }
        ]
      },
      {
        "name": "Huyện Nga Sơn",
        "code": "40133",
        "wards": [
          {
            "name": "Xã Nga Sơn",
            "code": "40133032"
          },
          {
            "name": "Xã Nga Thắng",
            "code": "40133033"
          },
          {
            "name": "Xã Hồ Vương",
            "code": "40133034"
          },
          {
            "name": "Xã Tân Tiến",
            "code": "40133035"
          },
          {
            "name": "Xã Nga An",
            "code": "40133036"
          },
          {
            "name": "Xã Ba Đình",
            "code": "40133037"
          }
        ]
      },
      {
        "name": "Huyện Ngọc Lặc",
        "code": "40121",
        "wards": [
          {
            "name": "Xã Ngọc Lặc",
            "code": "40121129"
          },
          {
            "name": "Xã Thạch Lập",
            "code": "40121130"
          },
          {
            "name": "Xã Ngọc Liên",
            "code": "40121131"
          },
          {
            "name": "Xã Minh Sơn",
            "code": "40121132"
          },
          {
            "name": "Xã Nguyệt Ấn",
            "code": "40121133"
          },
          {
            "name": "Xã Kiên Thọ",
            "code": "40121134"
          }
        ]
      },
      {
        "name": "Huyện Như Thanh",
        "code": "40127",
        "wards": [
          {
            "name": "Xã Xuân Du",
            "code": "40127152"
          },
          {
            "name": "Xã Mậu Lâm",
            "code": "40127153"
          },
          {
            "name": "Xã Như Thanh",
            "code": "40127154"
          },
          {
            "name": "Xã Yên Thọ",
            "code": "40127155"
          },
          {
            "name": "Xã Xuân Thái",
            "code": "40127156"
          },
          {
            "name": "Xã Thanh Kỳ",
            "code": "40127157"
          }
        ]
      },
      {
        "name": "Huyện Như Xuân",
        "code": "40125",
        "wards": [
          {
            "name": "Xã Như Xuân",
            "code": "40125146"
          },
          {
            "name": "Xã Thượng Ninh",
            "code": "40125147"
          },
          {
            "name": "Xã Xuân Bình",
            "code": "40125148"
          },
          {
            "name": "Xã Hóa Quỳ",
            "code": "40125149"
          },
          {
            "name": "Xã Thanh Quân",
            "code": "40125150"
          },
          {
            "name": "Xã Thanh Phong",
            "code": "40125151"
          }
        ]
      },
      {
        "name": "Huyện Nông Cống",
        "code": "40151",
        "wards": [
          {
            "name": "Xã Nông Cống",
            "code": "40151053"
          },
          {
            "name": "Xã Thắng Lợi",
            "code": "40151054"
          },
          {
            "name": "Xã Trung Chính",
            "code": "40151055"
          },
          {
            "name": "Xã Trường Văn",
            "code": "40151056"
          },
          {
            "name": "Xã Thăng Bình",
            "code": "40151057"
          },
          {
            "name": "Xã Tượng Lĩnh",
            "code": "40151058"
          },
          {
            "name": "Xã Công Chính",
            "code": "40151059"
          }
        ]
      },
      {
        "name": "Huyện Quan Hoá",
        "code": "40109",
        "wards": [
          {
            "name": "Xã Hồi Xuân",
            "code": "40109099"
          },
          {
            "name": "Xã Nam Xuân",
            "code": "40109100"
          },
          {
            "name": "Xã Thiên Phủ",
            "code": "40109101"
          },
          {
            "name": "Xã Hiền Kiệt",
            "code": "40109102"
          },
          {
            "name": "Xã Phú Xuân",
            "code": "40109103"
          },
          {
            "name": "Xã Phú Lệ",
            "code": "40109104"
          },
          {
            "name": "Xã Trung Thành",
            "code": "40109105"
          },
          {
            "name": "Xã Trung Sơn",
            "code": "40109106"
          }
        ]
      },
      {
        "name": "Huyện Quan Sơn",
        "code": "40111",
        "wards": [
          {
            "name": "Xã Na Mèo",
            "code": "40111107"
          },
          {
            "name": "Xã Sơn Thủy",
            "code": "40111108"
          },
          {
            "name": "Xã Sơn Điện",
            "code": "40111109"
          },
          {
            "name": "Xã Mường Mìn",
            "code": "40111110"
          },
          {
            "name": "Xã Tam Thanh",
            "code": "40111111"
          },
          {
            "name": "Xã Tam Lư",
            "code": "40111112"
          },
          {
            "name": "Xã Quan Sơn",
            "code": "40111113"
          },
          {
            "name": "Xã Trung Hạ",
            "code": "40111114"
          }
        ]
      },
      {
        "name": "Huyện Quảng Xương",
        "code": "40149",
        "wards": [
          {
            "name": "Xã Lưu Vệ",
            "code": "40149046"
          },
          {
            "name": "Xã Quảng Yên",
            "code": "40149047"
          },
          {
            "name": "Xã Quảng Ngọc",
            "code": "40149048"
          },
          {
            "name": "Xã Quảng Ninh",
            "code": "40149049"
          },
          {
            "name": "Xã Quảng Bình",
            "code": "40149050"
          },
          {
            "name": "Xã Tiên Trang",
            "code": "40149051"
          },
          {
            "name": "Xã Quảng Chính",
            "code": "40149052"
          }
        ]
      },
      {
        "name": "Huyện Thạch Thành",
        "code": "40119",
        "wards": [
          {
            "name": "Xã Kim Tân",
            "code": "40119140"
          },
          {
            "name": "Xã Vân Du",
            "code": "40119141"
          },
          {
            "name": "Xã Ngọc Trạo",
            "code": "40119142"
          },
          {
            "name": "Xã Thạch Bình",
            "code": "40119143"
          },
          {
            "name": "Xã Thành Vinh",
            "code": "40119144"
          },
          {
            "name": "Xã Thạch Quảng",
            "code": "40119145"
          }
        ]
      },
      {
        "name": "Huyện Thiệu Hoá",
        "code": "40141",
        "wards": [
          {
            "name": "Xã Thiệu Hóa",
            "code": "40141060"
          },
          {
            "name": "Xã Thiệu Quang",
            "code": "40141061"
          },
          {
            "name": "Xã Thiệu Tiến",
            "code": "40141062"
          },
          {
            "name": "Xã Thiệu Toán",
            "code": "40141063"
          },
          {
            "name": "Xã Thiệu Trung",
            "code": "40141064"
          }
        ]
      },
      {
        "name": "Huyện Thọ Xuân",
        "code": "40137",
        "wards": [
          {
            "name": "Xã Thọ Xuân",
            "code": "40137072"
          },
          {
            "name": "Xã Thọ Long",
            "code": "40137073"
          },
          {
            "name": "Xã Xuân Hoà",
            "code": "40137074"
          },
          {
            "name": "Xã Sao Vàng",
            "code": "40137075"
          },
          {
            "name": "Xã Lam Sơn",
            "code": "40137076"
          },
          {
            "name": "Xã Thọ Lập",
            "code": "40137077"
          },
          {
            "name": "Xã Xuân Tín",
            "code": "40137078"
          },
          {
            "name": "Xã Xuân Lập",
            "code": "40137079"
          }
        ]
      },
      {
        "name": "Huyện Thường Xuân",
        "code": "40123",
        "wards": [
          {
            "name": "Xã Bát Mọt",
            "code": "40123158"
          },
          {
            "name": "Xã Yên Nhân",
            "code": "40123159"
          },
          {
            "name": "Xã Lương Sơn",
            "code": "40123160"
          },
          {
            "name": "Xã Thường Xuân",
            "code": "40123161"
          },
          {
            "name": "Xã Luận Thành",
            "code": "40123162"
          },
          {
            "name": "Xã Tân Thành",
            "code": "40123163"
          },
          {
            "name": "Xã Vạn Xuân",
            "code": "40123164"
          },
          {
            "name": "Xã Thắng Lộc",
            "code": "40123165"
          },
          {
            "name": "Xã Xuân Chinh",
            "code": "40123166"
          }
        ]
      },
      {
        "name": "Huyện Triệu Sơn",
        "code": "40147",
        "wards": [
          {
            "name": "Xã Triệu Sơn",
            "code": "40147083"
          },
          {
            "name": "Xã Thọ Bình",
            "code": "40147084"
          },
          {
            "name": "Xã Thọ Ngọc",
            "code": "40147085"
          },
          {
            "name": "Xã Thọ Phú",
            "code": "40147086"
          },
          {
            "name": "Xã Hợp Tiến",
            "code": "40147087"
          },
          {
            "name": "Xã An Nông",
            "code": "40147088"
          },
          {
            "name": "Xã Tân Ninh",
            "code": "40147089"
          },
          {
            "name": "Xã Đồng Tiến",
            "code": "40147090"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Lộc",
        "code": "40129",
        "wards": [
          {
            "name": "Xã Vĩnh Lộc",
            "code": "40129080"
          },
          {
            "name": "Xã Tây Đô",
            "code": "40129081"
          },
          {
            "name": "Xã Biện Thượng",
            "code": "40129082"
          }
        ]
      },
      {
        "name": "Huyện Yên Định",
        "code": "40135",
        "wards": [
          {
            "name": "Xã Yên Định",
            "code": "40135065"
          },
          {
            "name": "Xã Yên Trường",
            "code": "40135066"
          },
          {
            "name": "Xã Yên Phú",
            "code": "40135067"
          },
          {
            "name": "Xã Quý Lộc",
            "code": "40135068"
          },
          {
            "name": "Xã Yên Ninh",
            "code": "40135069"
          },
          {
            "name": "Xã Định Tân",
            "code": "40135070"
          },
          {
            "name": "Xã Định Hoà",
            "code": "40135071"
          }
        ]
      },
      {
        "name": "Thành Phố Sầm Sơn",
        "code": "40105",
        "wards": [
          {
            "name": "Phường Sầm Sơn",
            "code": "40105008"
          },
          {
            "name": "Phường Nam Sầm Sơn",
            "code": "40105009"
          }
        ]
      },
      {
        "name": "Thành phố Thanh Hoá",
        "code": "40101",
        "wards": [
          {
            "name": "Phường Hạc Thành",
            "code": "40101001"
          },
          {
            "name": "Phường Quảng Phú",
            "code": "40101002"
          },
          {
            "name": "Phường Đông Quang",
            "code": "40101003"
          },
          {
            "name": "Phường Đông Sơn",
            "code": "40101004"
          },
          {
            "name": "Phường Đông Tiến",
            "code": "40101005"
          },
          {
            "name": "Phường Hàm Rồng",
            "code": "40101006"
          },
          {
            "name": "Phường Nguyệt Viên",
            "code": "40101007"
          }
        ]
      },
      {
        "name": "Thị xã Bỉm Sơn",
        "code": "40103",
        "wards": [
          {
            "name": "Phường Bỉm Sơn",
            "code": "40103010"
          },
          {
            "name": "Phường Quang Trung",
            "code": "40103011"
          }
        ]
      },
      {
        "name": "Thị xã Nghi Sơn",
        "code": "40153",
        "wards": [
          {
            "name": "Phường Ngọc Sơn",
            "code": "40153012"
          },
          {
            "name": "Phường Tân Dân",
            "code": "40153013"
          },
          {
            "name": "Phường Hải Lĩnh",
            "code": "40153014"
          },
          {
            "name": "Phường Tĩnh Gia",
            "code": "40153015"
          },
          {
            "name": "Phường Đào Duy Tư",
            "code": "40153016"
          },
          {
            "name": "Phường Hải Bình",
            "code": "40153017"
          },
          {
            "name": "Phường Trúc Lâm",
            "code": "40153018"
          },
          {
            "name": "Phường Nghi Sơn",
            "code": "40153019"
          },
          {
            "name": "Xã Các Sơn",
            "code": "40153020"
          },
          {
            "name": "Xã Trường Lâm",
            "code": "40153021"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Tuyên Quang",
    "code": "08",
    "districts": [
      {
        "name": "Huyện Bắc Mê",
        "code": "20111",
        "wards": [
          {
            "name": "Xã Yên Cường",
            "code": "20111075"
          },
          {
            "name": "Xã Đường Hồng",
            "code": "20111076"
          },
          {
            "name": "Xã Bắc Mê",
            "code": "20111077"
          },
          {
            "name": "Xã Giáp Trung",
            "code": "20111078"
          },
          {
            "name": "Xã Minh Sơn",
            "code": "20111079"
          },
          {
            "name": "Xã Minh Ngọc",
            "code": "20111080"
          }
        ]
      },
      {
        "name": "Huyện Bắc Quang",
        "code": "20119",
        "wards": [
          {
            "name": "Xã Tân Quang",
            "code": "20119096"
          },
          {
            "name": "Xã Đồng Tâm",
            "code": "20119097"
          },
          {
            "name": "Xã Liên Hiệp",
            "code": "20119098"
          },
          {
            "name": "Xã Bằng Hành",
            "code": "20119099"
          },
          {
            "name": "Xã Bắc Quang",
            "code": "20119100"
          },
          {
            "name": "Xã Hùng An",
            "code": "20119101"
          },
          {
            "name": "Xã Vĩnh Tuy",
            "code": "20119102"
          },
          {
            "name": "Xã Đồng Yên",
            "code": "20119103"
          }
        ]
      },
      {
        "name": "Huyện Chiêm Hoá",
        "code": "21105",
        "wards": [
          {
            "name": "Xã Tân Mỹ",
            "code": "21105010"
          },
          {
            "name": "Xã Yên Lập",
            "code": "21105011"
          },
          {
            "name": "Xã Tân An",
            "code": "21105012"
          },
          {
            "name": "Xã Chiêm Hoá",
            "code": "21105013"
          },
          {
            "name": "Xã Hoà An",
            "code": "21105014"
          },
          {
            "name": "Xã Kiên Đài",
            "code": "21105015"
          },
          {
            "name": "Xã Tri Phú",
            "code": "21105016"
          },
          {
            "name": "Xã Kim Bình",
            "code": "21105017"
          },
          {
            "name": "Xã Yên Nguyên",
            "code": "21105018"
          },
          {
            "name": "Xã Trung Hà",
            "code": "21105019"
          }
        ]
      },
      {
        "name": "Huyện Đồng Văn",
        "code": "20103",
        "wards": [
          {
            "name": "Xã Lũng Cú",
            "code": "20103052"
          },
          {
            "name": "Xã Đồng Văn",
            "code": "20103053"
          },
          {
            "name": "Xã Sà Phìn",
            "code": "20103054"
          },
          {
            "name": "Xã Phố Bảng",
            "code": "20103055"
          },
          {
            "name": "Xã Lũng Phìn",
            "code": "20103056"
          }
        ]
      },
      {
        "name": "Huyện Hàm Yên",
        "code": "21107",
        "wards": [
          {
            "name": "Xã Yên Phú",
            "code": "21107020"
          },
          {
            "name": "Xã Bạch Xa",
            "code": "21107021"
          },
          {
            "name": "Xã Phù Lưu",
            "code": "21107022"
          },
          {
            "name": "Xã Hàm Yên",
            "code": "21107023"
          },
          {
            "name": "Xã Bình Xa",
            "code": "21107024"
          },
          {
            "name": "Xã Thái Sơn",
            "code": "21107025"
          },
          {
            "name": "Xã Thái Hoà",
            "code": "21107026"
          },
          {
            "name": "Xã Hùng Đức",
            "code": "21107027"
          }
        ]
      },
      {
        "name": "Huyện Hoàng Su Phì",
        "code": "20113",
        "wards": [
          {
            "name": "Xã Thông Nguyên",
            "code": "20113111"
          },
          {
            "name": "Xã Hồ Thầu",
            "code": "20113112"
          },
          {
            "name": "Xã Nậm Dịch",
            "code": "20113113"
          },
          {
            "name": "Xã Tân Tiến",
            "code": "20113114"
          },
          {
            "name": "Xã Hoàng Su Phì",
            "code": "20113115"
          },
          {
            "name": "Xã Thàng Tín",
            "code": "20113116"
          },
          {
            "name": "Xã Bản Máy",
            "code": "20113117"
          },
          {
            "name": "Xã Pờ Ly Ngài",
            "code": "20113118"
          }
        ]
      },
      {
        "name": "Huyện Lâm Bình",
        "code": "21113",
        "wards": [
          {
            "name": "Xã Thượng Lâm",
            "code": "21113001"
          },
          {
            "name": "Xã Lâm Bình",
            "code": "21113002"
          },
          {
            "name": "Xã Minh Quang",
            "code": "21113003"
          },
          {
            "name": "Xã Bình An",
            "code": "21113004"
          }
        ]
      },
      {
        "name": "Huyện Mèo Vạc",
        "code": "20105",
        "wards": [
          {
            "name": "Xã Sủng Máng",
            "code": "20105057"
          },
          {
            "name": "Xã Sơn Vĩ",
            "code": "20105058"
          },
          {
            "name": "Xã Mèo Vạc",
            "code": "20105059"
          },
          {
            "name": "Xã Khâu Vai",
            "code": "20105060"
          },
          {
            "name": "Xã Niêm Sơn",
            "code": "20105061"
          },
          {
            "name": "Xã Tát Ngà",
            "code": "20105062"
          }
        ]
      },
      {
        "name": "Huyện Na Hang",
        "code": "21103",
        "wards": [
          {
            "name": "Xã Côn Lôn",
            "code": "21103005"
          },
          {
            "name": "Xã Yên Hoa",
            "code": "21103006"
          },
          {
            "name": "Xã Thượng Nông",
            "code": "21103007"
          },
          {
            "name": "Xã Hồng Thái",
            "code": "21103008"
          },
          {
            "name": "Xã Nà Hang",
            "code": "21103009"
          }
        ]
      },
      {
        "name": "Huyện Quản Bạ",
        "code": "20109",
        "wards": [
          {
            "name": "Xã Lùng Tám",
            "code": "20109070"
          },
          {
            "name": "Xã Cán Tỷ",
            "code": "20109071"
          },
          {
            "name": "Xã Nghĩa Thuận",
            "code": "20109072"
          },
          {
            "name": "Xã Quản Bạ",
            "code": "20109073"
          },
          {
            "name": "Xã Tùng Vài",
            "code": "20109074"
          }
        ]
      },
      {
        "name": "Huyện Quang Bình",
        "code": "20118",
        "wards": [
          {
            "name": "Xã Tiên Yên",
            "code": "20118104"
          },
          {
            "name": "Xã Xuân Giang",
            "code": "20118105"
          },
          {
            "name": "Xã Bằng Lang",
            "code": "20118106"
          },
          {
            "name": "Xã Yên Thành",
            "code": "20118107"
          },
          {
            "name": "Xã Quang Bình",
            "code": "20118108"
          },
          {
            "name": "Xã Tân Trịnh",
            "code": "20118109"
          },
          {
            "name": "Xã Tiên Nguyên",
            "code": "20118110"
          }
        ]
      },
      {
        "name": "Huyện Sơn Dương",
        "code": "21111",
        "wards": [
          {
            "name": "Xã Tân Trào",
            "code": "21111037"
          },
          {
            "name": "Xã Minh Thanh",
            "code": "21111038"
          },
          {
            "name": "Xã Sơn Dương",
            "code": "21111039"
          },
          {
            "name": "Xã Bình Ca",
            "code": "21111040"
          },
          {
            "name": "Xã Tân Thanh",
            "code": "21111041"
          },
          {
            "name": "Xã Sơn Thuỷ",
            "code": "21111042"
          },
          {
            "name": "Xã Phú Lương",
            "code": "21111043"
          },
          {
            "name": "Xã Trường Sinh",
            "code": "21111044"
          },
          {
            "name": "Xã Hồng Sơn",
            "code": "21111045"
          },
          {
            "name": "Xã Đông Thọ",
            "code": "21111046"
          }
        ]
      },
      {
        "name": "Huyện Vị Xuyên",
        "code": "20115",
        "wards": [
          {
            "name": "Xã Lao Chải",
            "code": "20115084"
          },
          {
            "name": "Xã Thanh Thuỷ",
            "code": "20115085"
          },
          {
            "name": "Xã Minh Tân",
            "code": "20115086"
          },
          {
            "name": "Xã Thuận Hoà",
            "code": "20115087"
          },
          {
            "name": "Xã Tùng Bá",
            "code": "20115088"
          },
          {
            "name": "Xã Phú Linh",
            "code": "20115089"
          },
          {
            "name": "Xã Linh Hồ",
            "code": "20115090"
          },
          {
            "name": "Xã Bạch Ngọc",
            "code": "20115091"
          },
          {
            "name": "Xã Vị Xuyên",
            "code": "20115092"
          },
          {
            "name": "Xã Việt Lâm",
            "code": "20115093"
          },
          {
            "name": "Xã Cao Bồ",
            "code": "20115094"
          },
          {
            "name": "Xã Thượng Sơn",
            "code": "20115095"
          }
        ]
      },
      {
        "name": "Huyện Xín Mần",
        "code": "20117",
        "wards": [
          {
            "name": "Xã Xín Mần",
            "code": "20117119"
          },
          {
            "name": "Xã Pà Vầy Sủ",
            "code": "20117120"
          },
          {
            "name": "Xã Nấm Dẩn",
            "code": "20117121"
          },
          {
            "name": "Xã Trung Thịnh",
            "code": "20117122"
          },
          {
            "name": "Xã Quảng Nguyên",
            "code": "20117123"
          },
          {
            "name": "Xã Khuôn Lùng",
            "code": "20117124"
          }
        ]
      },
      {
        "name": "Huyện Yên Minh",
        "code": "20107",
        "wards": [
          {
            "name": "Xã Thắng Mố",
            "code": "20107063"
          },
          {
            "name": "Xã Bạch Đích",
            "code": "20107064"
          },
          {
            "name": "Xã Yên Minh",
            "code": "20107065"
          },
          {
            "name": "Xã Mậu Duệ",
            "code": "20107066"
          },
          {
            "name": "Xã Ngọc Long",
            "code": "20107067"
          },
          {
            "name": "Xã Du Già",
            "code": "20107068"
          },
          {
            "name": "Xã Đường Thượng",
            "code": "20107069"
          }
        ]
      },
      {
        "name": "Huyện Yên Sơn",
        "code": "21109",
        "wards": [
          {
            "name": "Xã Hùng Lợi",
            "code": "21109028"
          },
          {
            "name": "Xã Trung Sơn",
            "code": "21109029"
          },
          {
            "name": "Xã Thái Bình",
            "code": "21109030"
          },
          {
            "name": "Xã Tân Long",
            "code": "21109031"
          },
          {
            "name": "Xã Xuân Vân",
            "code": "21109032"
          },
          {
            "name": "Xã Lực Hành",
            "code": "21109033"
          },
          {
            "name": "Xã Yên Sơn",
            "code": "21109034"
          },
          {
            "name": "Xã Nhữ Khê",
            "code": "21109035"
          },
          {
            "name": "Xã Kiến Thiết",
            "code": "21109036"
          }
        ]
      },
      {
        "name": "Thành phố Hà Giang",
        "code": "20101",
        "wards": [
          {
            "name": "Xã Ngọc Đường",
            "code": "20101081"
          },
          {
            "name": "Phường Hà Giang 1",
            "code": "20101082"
          },
          {
            "name": "Phường Hà Giang 2",
            "code": "20101083"
          }
        ]
      },
      {
        "name": "Thành phố Tuyên Quang",
        "code": "21101",
        "wards": [
          {
            "name": "Phường Mỹ Lâm",
            "code": "21101047"
          },
          {
            "name": "Phường Minh Xuân",
            "code": "21101048"
          },
          {
            "name": "Phường Nông Tiến",
            "code": "21101049"
          },
          {
            "name": "Phường An Tường",
            "code": "21101050"
          },
          {
            "name": "Phường Bình Thuận",
            "code": "21101051"
          }
        ]
      }
    ]
  },
  {
    "name": "Tỉnh Vĩnh Long",
    "code": "30",
    "districts": [
      {
        "name": "Huyện Ba Tri",
        "code": "81113",
        "wards": [
          {
            "name": "Xã Tân Thủy",
            "code": "81113104"
          },
          {
            "name": "Xã Bảo Thạnh",
            "code": "81113105"
          },
          {
            "name": "Xã Ba Tri",
            "code": "81113106"
          },
          {
            "name": "Xã Tân Xuân",
            "code": "81113107"
          },
          {
            "name": "Xã Mỹ Chánh Hòa",
            "code": "81113108"
          },
          {
            "name": "Xã An Ngãi Trung",
            "code": "81113109"
          },
          {
            "name": "Xã An Hiệp",
            "code": "81113110"
          }
        ]
      },
      {
        "name": "Huyện Bình Đại",
        "code": "81111",
        "wards": [
          {
            "name": "Xã Thới Thuận",
            "code": "81111118"
          },
          {
            "name": "Xã Thạnh Phước",
            "code": "81111119"
          },
          {
            "name": "Xã Bình Đại",
            "code": "81111120"
          },
          {
            "name": "Xã Thạnh Trị",
            "code": "81111121"
          },
          {
            "name": "Xã Lộc Thuận",
            "code": "81111122"
          },
          {
            "name": "Xã Châu Hưng",
            "code": "81111123"
          },
          {
            "name": "Xã Phú Thuận",
            "code": "81111124"
          }
        ]
      },
      {
        "name": "Huyện Bình Tân",
        "code": "80908",
        "wards": [
          {
            "name": "Xã Tân Quới",
            "code": "80908030"
          },
          {
            "name": "Xã Tân Lược",
            "code": "80908031"
          },
          {
            "name": "Xã Mỹ Thuận",
            "code": "80908032"
          }
        ]
      },
      {
        "name": "Huyện Càng Long",
        "code": "81703",
        "wards": [
          {
            "name": "Xã Càng Long",
            "code": "81703042"
          },
          {
            "name": "Xã An Trường",
            "code": "81703040"
          },
          {
            "name": "Xã Tân An",
            "code": "81703041"
          },
          {
            "name": "Xã Nhị Long",
            "code": "81703043"
          },
          {
            "name": "Xã Bình Phú",
            "code": "81703044"
          }
        ]
      },
      {
        "name": "Huyện Cầu Kè",
        "code": "81707",
        "wards": [
          {
            "name": "Xã Cầu Kè",
            "code": "81707050"
          },
          {
            "name": "Xã Phong Thạnh",
            "code": "81707051"
          },
          {
            "name": "Xã An Phú Tân",
            "code": "81707052"
          },
          {
            "name": "Xã Tam Ngãi",
            "code": "81707053"
          }
        ]
      },
      {
        "name": "Huyện Cầu Ngang",
        "code": "81711",
        "wards": [
          {
            "name": "Xã Cầu Ngang",
            "code": "81711060"
          },
          {
            "name": "Xã Mỹ Long",
            "code": "81711058"
          },
          {
            "name": "Xã Vinh Kim",
            "code": "81711059"
          },
          {
            "name": "Xã Nhị Trường",
            "code": "81711061"
          },
          {
            "name": "Xã Hiệp Mỹ",
            "code": "81711062"
          }
        ]
      },
      {
        "name": "Huyện Châu Thành",
        "code": "81705",
        "wards": [
          {
            "name": "Xã Châu Thành",
            "code": "81705046"
          },
          {
            "name": "Xã Song Lộc",
            "code": "81705045"
          },
          {
            "name": "Xã Hưng Mỹ",
            "code": "81705047"
          },
          {
            "name": "Xã Hòa Minh",
            "code": "81705048"
          },
          {
            "name": "Xã Long Hòa",
            "code": "81705049"
          },
          {
            "name": "Phường Phú Tân",
            "code": "81103081"
          },
          {
            "name": "Xã Phú Túc",
            "code": "81103082"
          },
          {
            "name": "Xã Giao Long",
            "code": "81103083"
          },
          {
            "name": "Xã Tiên Thủy",
            "code": "81103084"
          },
          {
            "name": "Xã Tân Phú",
            "code": "81103085"
          }
        ]
      },
      {
        "name": "Huyện Chợ Lách",
        "code": "81105",
        "wards": [
          {
            "name": "Xã Phú Phụng",
            "code": "81105086"
          },
          {
            "name": "Xã Chợ Lách",
            "code": "81105087"
          },
          {
            "name": "Xã Vĩnh Thành",
            "code": "81105088"
          },
          {
            "name": "Xã Hưng Khánh Trung",
            "code": "81105089"
          }
        ]
      },
      {
        "name": "Huyện Duyên Hải",
        "code": "81715",
        "wards": [
          {
            "name": "Xã Long Thành",
            "code": "81715072"
          },
          {
            "name": "Xã Đông Hải",
            "code": "81715073"
          },
          {
            "name": "Xã Long Vĩnh",
            "code": "81715074"
          },
          {
            "name": "Xã Đôn Châu",
            "code": "81715075"
          },
          {
            "name": "Xã Ngũ Lạc",
            "code": "81715076"
          }
        ]
      },
      {
        "name": "Huyện Giồng Trôm",
        "code": "81109",
        "wards": [
          {
            "name": "Xã Hưng Nhượng",
            "code": "81109111"
          },
          {
            "name": "Xã Giồng Trôm",
            "code": "81109112"
          },
          {
            "name": "Xã Tân Hào",
            "code": "81109113"
          },
          {
            "name": "Xã Phước Long",
            "code": "81109114"
          },
          {
            "name": "Xã Lương Phú",
            "code": "81109115"
          },
          {
            "name": "Xã Châu Hòa",
            "code": "81109116"
          },
          {
            "name": "Xã Lương Hòa",
            "code": "81109117"
          }
        ]
      },
      {
        "name": "Huyện Long Hồ",
        "code": "80903",
        "wards": [
          {
            "name": "Xã An Bình",
            "code": "80903005"
          },
          {
            "name": "Xã Long Hồ",
            "code": "80903006"
          },
          {
            "name": "Xã Phú Quới",
            "code": "80903007"
          }
        ]
      },
      {
        "name": "Huyện Mang Thít",
        "code": "80905",
        "wards": [
          {
            "name": "Xã Cái Nhum",
            "code": "80905001"
          },
          {
            "name": "Xã Tân Long Hội",
            "code": "80905002"
          },
          {
            "name": "Xã Nhơn Phú",
            "code": "80905003"
          },
          {
            "name": "Xã Bình Phước",
            "code": "80905004"
          }
        ]
      },
      {
        "name": "Huyện Mỏ Cày Bắc",
        "code": "81108",
        "wards": [
          {
            "name": "Xã Phước Mỹ Trung",
            "code": "81108090"
          },
          {
            "name": "Xã Tân Thành Bình",
            "code": "81108091"
          },
          {
            "name": "Xã Nhuận Phú Tân",
            "code": "81108092"
          }
        ]
      },
      {
        "name": "Huyện Mỏ Cày Nam",
        "code": "81107",
        "wards": [
          {
            "name": "Xã Đồng Khởi",
            "code": "81107093"
          },
          {
            "name": "Xã Mỏ Cày",
            "code": "81107094"
          },
          {
            "name": "Xã Thành Thới",
            "code": "81107095"
          },
          {
            "name": "Xã An Định",
            "code": "81107096"
          },
          {
            "name": "Xã Hương Mỹ",
            "code": "81107097"
          }
        ]
      },
      {
        "name": "Huyện Tam Bình",
        "code": "80909",
        "wards": [
          {
            "name": "Xã Hòa Hiệp",
            "code": "80909025"
          },
          {
            "name": "Xã Tam Bình",
            "code": "80909026"
          },
          {
            "name": "Xã Ngãi Tứ",
            "code": "80909027"
          },
          {
            "name": "Xã Song Phú",
            "code": "80909028"
          },
          {
            "name": "Xã Cái Ngang",
            "code": "80909029"
          }
        ]
      },
      {
        "name": "Huyện Thạnh Phú",
        "code": "81115",
        "wards": [
          {
            "name": "Xã Đại Điền",
            "code": "81115098"
          },
          {
            "name": "Xã Quới Điền",
            "code": "81115099"
          },
          {
            "name": "Xã Thạnh Phú",
            "code": "81115100"
          },
          {
            "name": "Xã An Qui",
            "code": "81115101"
          },
          {
            "name": "Xã Thạnh Hải",
            "code": "81115102"
          },
          {
            "name": "Xã Thạnh Phong",
            "code": "81115103"
          }
        ]
      },
      {
        "name": "Huyện Tiểu Cần",
        "code": "81709",
        "wards": [
          {
            "name": "Xã Tiểu Cần",
            "code": "81709056"
          },
          {
            "name": "Xã Tân Hòa",
            "code": "81709054"
          },
          {
            "name": "Xã Hùng Hòa",
            "code": "81709055"
          },
          {
            "name": "Xã Tập Ngãi",
            "code": "81709057"
          }
        ]
      },
      {
        "name": "Huyện Trà Cú",
        "code": "81713",
        "wards": [
          {
            "name": "Xã Trà Cú",
            "code": "81713066"
          },
          {
            "name": "Xã Lưu Nghiệp Anh",
            "code": "81713063"
          },
          {
            "name": "Xã Đại An",
            "code": "81713064"
          },
          {
            "name": "Xã Hàm Giang",
            "code": "81713065"
          },
          {
            "name": "Xã Long Hiệp",
            "code": "81713067"
          },
          {
            "name": "Xã Tập Sơn",
            "code": "81713068"
          }
        ]
      },
      {
        "name": "Huyện Trà Ôn",
        "code": "80911",
        "wards": [
          {
            "name": "Xã Lục Sỹ Thành",
            "code": "80911020"
          },
          {
            "name": "Xã Trà Ôn",
            "code": "80911021"
          },
          {
            "name": "Xã Trà Côn",
            "code": "80911022"
          },
          {
            "name": "Xã Vĩnh Xuân",
            "code": "80911023"
          },
          {
            "name": "Xã Hòa Bình",
            "code": "80911024"
          }
        ]
      },
      {
        "name": "Huyện Vũng Liêm",
        "code": "80913",
        "wards": [
          {
            "name": "Xã Quới Thiện",
            "code": "80913013"
          },
          {
            "name": "Xã Trung Thành",
            "code": "80913014"
          },
          {
            "name": "Xã Trung Ngãi",
            "code": "80913015"
          },
          {
            "name": "Xã Quới An",
            "code": "80913016"
          },
          {
            "name": "Xã Trung Hiệp",
            "code": "80913017"
          },
          {
            "name": "Xã Hiếu Phụng",
            "code": "80913018"
          },
          {
            "name": "Xã Hiếu Thành",
            "code": "80913019"
          }
        ]
      },
      {
        "name": "Thành phố Bến Tre",
        "code": "81101",
        "wards": [
          {
            "name": "Phường An Hội",
            "code": "81101077"
          },
          {
            "name": "Phường Phú Khương",
            "code": "81101078"
          },
          {
            "name": "Phường Bến Tre",
            "code": "81101079"
          },
          {
            "name": "Phường Sơn Đông",
            "code": "81101080"
          }
        ]
      },
      {
        "name": "Thành phố Trà Vinh",
        "code": "81701",
        "wards": [
          {
            "name": "Phường Trà Vinh",
            "code": "81701037"
          },
          {
            "name": "Phường Long Đức",
            "code": "81701036"
          },
          {
            "name": "Phường Nguyệt Hóa",
            "code": "81701038"
          },
          {
            "name": "Phường Hòa Thuận",
            "code": "81701039"
          }
        ]
      },
      {
        "name": "Thành phố Vĩnh Long",
        "code": "80901",
        "wards": [
          {
            "name": "Phường Thanh Đức",
            "code": "80901008"
          },
          {
            "name": "Phường Long Châu",
            "code": "80901009"
          },
          {
            "name": "Phường Phước Hậu",
            "code": "80901010"
          },
          {
            "name": "Phường Tân Hạnh",
            "code": "80901011"
          },
          {
            "name": "Phường Tân Ngãi",
            "code": "80901012"
          }
        ]
      },
      {
        "name": "Thị xã Bình Minh",
        "code": "80907",
        "wards": [
          {
            "name": "Phường Bình Minh",
            "code": "80907033"
          },
          {
            "name": "Phường Cái Vồn",
            "code": "80907034"
          },
          {
            "name": "Phường Đông Thành",
            "code": "80907035"
          }
        ]
      },
      {
        "name": "Thị xã Duyên Hải",
        "code": "81716",
        "wards": [
          {
            "name": "Phường Duyên Hải",
            "code": "81716069"
          },
          {
            "name": "Phường Trường Long Hòa",
            "code": "81716070"
          },
          {
            "name": "Xã Long Hữu",
            "code": "81716071"
          }
        ]
      }
    ]
  },
  {
    "name": "Tp Cần Thơ",
    "code": "33",
    "districts": [
      {
        "name": "Huyện Châu Thành",
        "code": "81605",
        "wards": [
          {
            "name": "Xã Châu Thành",
            "code": "81605049"
          },
          {
            "name": "Xã Đông Phước",
            "code": "81605050"
          },
          {
            "name": "Xã Phú Hữu",
            "code": "81605051"
          },
          {
            "name": "Xã Phú Tâm",
            "code": "81915078"
          },
          {
            "name": "Xã An Ninh",
            "code": "81915079"
          },
          {
            "name": "Xã Thuận Hoà",
            "code": "81915080"
          },
          {
            "name": "Xã Hồ Đắc Kiện",
            "code": "81915081"
          }
        ]
      },
      {
        "name": "Huyện Châu Thành A",
        "code": "81603",
        "wards": [
          {
            "name": "Xã Thạnh Xuân",
            "code": "81603046"
          },
          {
            "name": "Xã Tân Hoà",
            "code": "81603047"
          },
          {
            "name": "Xã Trường Long Tây",
            "code": "81603048"
          }
        ]
      },
      {
        "name": "Huyện Cờ Đỏ",
        "code": "81527",
        "wards": [
          {
            "name": "Xã Cờ Đỏ",
            "code": "81527024"
          },
          {
            "name": "Xã Đông Hiệp",
            "code": "81527025"
          },
          {
            "name": "Xã Thạnh Phú",
            "code": "81527026"
          },
          {
            "name": "Xã Thới Hưng",
            "code": "81527027"
          },
          {
            "name": "Xã Trung Hưng",
            "code": "81527028"
          }
        ]
      },
      {
        "name": "Huyện Cù Lao Dung",
        "code": "81906",
        "wards": [
          {
            "name": "Xã An Thạnh",
            "code": "81906102"
          },
          {
            "name": "Xã Cù Lao Dung",
            "code": "81906103"
          }
        ]
      },
      {
        "name": "Huyện Kế Sách",
        "code": "81903",
        "wards": [
          {
            "name": "Xã Nhơn Mỹ",
            "code": "81903072"
          },
          {
            "name": "Xã Phong Nẫm",
            "code": "81903073"
          },
          {
            "name": "Xã An Lạc Thôn",
            "code": "81903074"
          },
          {
            "name": "Xã Kế Sách",
            "code": "81903075"
          },
          {
            "name": "Xã Thới An Hội",
            "code": "81903076"
          },
          {
            "name": "Xã Đại Hải",
            "code": "81903077"
          }
        ]
      },
      {
        "name": "Huyện Long Mỹ",
        "code": "81611",
        "wards": [
          {
            "name": "Xã Vĩnh Viễn",
            "code": "81611040"
          },
          {
            "name": "Xã Xà Phiên",
            "code": "81611041"
          },
          {
            "name": "Xã Lương Tâm",
            "code": "81611042"
          }
        ]
      },
      {
        "name": "Huyện Long Phú",
        "code": "81905",
        "wards": [
          {
            "name": "Xã Trường Khánh",
            "code": "81905068"
          },
          {
            "name": "Xã Đại Ngãi",
            "code": "81905069"
          },
          {
            "name": "Xã Tân Thạnh",
            "code": "81905070"
          },
          {
            "name": "Xã Long Phú",
            "code": "81905071"
          }
        ]
      },
      {
        "name": "Huyện Mỹ Tú",
        "code": "81907",
        "wards": [
          {
            "name": "Xã Mỹ Tú",
            "code": "81907082"
          },
          {
            "name": "Xã Long Hưng",
            "code": "81907083"
          },
          {
            "name": "Xã Mỹ Phước",
            "code": "81907084"
          },
          {
            "name": "Xã Mỹ Hương",
            "code": "81907085"
          }
        ]
      },
      {
        "name": "Huyện Mỹ Xuyên",
        "code": "81909",
        "wards": [
          {
            "name": "Xã Hoà Tú",
            "code": "81909064"
          },
          {
            "name": "Xã Gia Hoà",
            "code": "81909065"
          },
          {
            "name": "Xã Nhu Gia",
            "code": "81909066"
          },
          {
            "name": "Xã Ngọc Tố",
            "code": "81909067"
          }
        ]
      },
      {
        "name": "Huyện Phong Điền",
        "code": "81529",
        "wards": [
          {
            "name": "Xã Phong Điền",
            "code": "81529017"
          },
          {
            "name": "Xã Nhơn Ái",
            "code": "81529018"
          },
          {
            "name": "Xã Trường Long",
            "code": "81529019"
          }
        ]
      },
      {
        "name": "Huyện Phụng Hiệp",
        "code": "81608",
        "wards": [
          {
            "name": "Xã Tân Bình",
            "code": "81608054"
          },
          {
            "name": "Xã Hoà An",
            "code": "81608055"
          },
          {
            "name": "Xã Phương Bình",
            "code": "81608056"
          },
          {
            "name": "Xã Tân Phước Hưng",
            "code": "81608057"
          },
          {
            "name": "Xã Hiệp Hưng",
            "code": "81608058"
          },
          {
            "name": "Xã Phụng Hiệp",
            "code": "81608059"
          },
          {
            "name": "Xã Thạnh Hoà",
            "code": "81608060"
          }
        ]
      },
      {
        "name": "Huyện Thạnh Trị",
        "code": "81911",
        "wards": [
          {
            "name": "Xã Phú Lộc",
            "code": "81911094"
          },
          {
            "name": "Xã Vĩnh Lợi",
            "code": "81911095"
          },
          {
            "name": "Xã Lâm Tân",
            "code": "81911096"
          }
        ]
      },
      {
        "name": "Huyện Thới Lai",
        "code": "81531",
        "wards": [
          {
            "name": "Xã Thới Lai",
            "code": "81531020"
          },
          {
            "name": "Xã Đông Thuận",
            "code": "81531021"
          },
          {
            "name": "Xã Trường Xuân",
            "code": "81531022"
          },
          {
            "name": "Xã Trường Thành",
            "code": "81531023"
          }
        ]
      },
      {
        "name": "Huyện Trần Đề",
        "code": "81917",
        "wards": [
          {
            "name": "Xã Thạnh Thới An",
            "code": "81917097"
          },
          {
            "name": "Xã Tài Văn",
            "code": "81917098"
          },
          {
            "name": "Xã Liêu Tú",
            "code": "81917099"
          },
          {
            "name": "Xã Lịch Hội Thượng",
            "code": "81917100"
          },
          {
            "name": "Xã Trần Đề",
            "code": "81917101"
          }
        ]
      },
      {
        "name": "Huyện Vị Thủy",
        "code": "81609",
        "wards": [
          {
            "name": "Xã Vị Thủy",
            "code": "81609036"
          },
          {
            "name": "Xã Vĩnh Thuận Đông",
            "code": "81609037"
          },
          {
            "name": "Xã Vị Thanh 1",
            "code": "81609038"
          },
          {
            "name": "Xã Vĩnh Tường",
            "code": "81609039"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Thạnh",
        "code": "81525",
        "wards": [
          {
            "name": "Xã Vĩnh Thạnh",
            "code": "81525029"
          },
          {
            "name": "Xã Vĩnh Trinh",
            "code": "81525030"
          },
          {
            "name": "Xã Thạnh An",
            "code": "81525031"
          },
          {
            "name": "Xã Thạnh Quới",
            "code": "81525032"
          }
        ]
      },
      {
        "name": "Quận Bình Thuỷ",
        "code": "81521",
        "wards": [
          {
            "name": "Phường Thới An Đông",
            "code": "81521005"
          },
          {
            "name": "Phường Bình Thủy",
            "code": "81521006"
          },
          {
            "name": "Phường Long Tuyền",
            "code": "81521007"
          }
        ]
      },
      {
        "name": "Quận Cái Răng",
        "code": "81523",
        "wards": [
          {
            "name": "Phường Cái Răng",
            "code": "81523008"
          },
          {
            "name": "Phường Hưng Phú",
            "code": "81523009"
          }
        ]
      },
      {
        "name": "Quận Ninh Kiều",
        "code": "81519",
        "wards": [
          {
            "name": "Phường Ninh Kiều",
            "code": "81519001"
          },
          {
            "name": "Phường Cái Khế",
            "code": "81519002"
          },
          {
            "name": "Phường Tân An",
            "code": "81519003"
          },
          {
            "name": "Phường An Bình",
            "code": "81519004"
          }
        ]
      },
      {
        "name": "Quận Ô Môn",
        "code": "81505",
        "wards": [
          {
            "name": "Phường Ô Môn",
            "code": "81505010"
          },
          {
            "name": "Phường Thới Long",
            "code": "81505011"
          },
          {
            "name": "Phường Phước Thới",
            "code": "81505012"
          }
        ]
      },
      {
        "name": "Quận Thốt Nốt",
        "code": "81503",
        "wards": [
          {
            "name": "Phường Trung Nhứt",
            "code": "81503013"
          },
          {
            "name": "Phường Thốt Nốt",
            "code": "81503014"
          },
          {
            "name": "Phường Thuận Hưng",
            "code": "81503015"
          },
          {
            "name": "Phường Tân Lộc",
            "code": "81503016"
          }
        ]
      },
      {
        "name": "Thành phố Ngã Bảy",
        "code": "81607",
        "wards": [
          {
            "name": "Phường Đại Thành",
            "code": "81607052"
          },
          {
            "name": "Phường Ngã Bảy",
            "code": "81607053"
          }
        ]
      },
      {
        "name": "Thành phố Sóc Trăng",
        "code": "81901",
        "wards": [
          {
            "name": "Phường Phú Lợi",
            "code": "81901061"
          },
          {
            "name": "Phường Sóc Trăng",
            "code": "81901062"
          },
          {
            "name": "Phường Mỹ Xuyên",
            "code": "81901063"
          }
        ]
      },
      {
        "name": "Thành phố Vị Thanh",
        "code": "81601",
        "wards": [
          {
            "name": "Xã Hỏa Lựu",
            "code": "81601033"
          },
          {
            "name": "Phường Vị Thanh",
            "code": "81601034"
          },
          {
            "name": "Phường Vị Tân",
            "code": "81601035"
          }
        ]
      },
      {
        "name": "Thị xã Long Mỹ",
        "code": "81612",
        "wards": [
          {
            "name": "Phường Long Bình",
            "code": "81612043"
          },
          {
            "name": "Phường Long Mỹ",
            "code": "81612044"
          },
          {
            "name": "Phường Long Phú 1",
            "code": "81612045"
          }
        ]
      },
      {
        "name": "Thị xã Ngã Năm",
        "code": "81912",
        "wards": [
          {
            "name": "Xã Tân Long",
            "code": "81912091"
          },
          {
            "name": "Phường Ngã Năm",
            "code": "81912092"
          },
          {
            "name": "Phường Mỹ Quới",
            "code": "81912093"
          }
        ]
      },
      {
        "name": "Thị xã Vĩnh Châu",
        "code": "81913",
        "wards": [
          {
            "name": "Xã Vĩnh Hải",
            "code": "81913086"
          },
          {
            "name": "Xã Lai Hoà",
            "code": "81913087"
          },
          {
            "name": "Phường Vĩnh Phước",
            "code": "81913088"
          },
          {
            "name": "Phường Vĩnh Châu",
            "code": "81913089"
          },
          {
            "name": "Phường Khánh Hoà",
            "code": "81913090"
          }
        ]
      }
    ]
  },
  {
    "name": "Tp Đà Nẵng",
    "code": "21",
    "districts": [
      {
        "name": "Huyện Bắc Trà My",
        "code": "50327",
        "wards": [
          {
            "name": "Xã Trà Liên",
            "code": "50327034"
          },
          {
            "name": "Xã Trà Giáp",
            "code": "50327035"
          },
          {
            "name": "Xã Trà Tân",
            "code": "50327036"
          },
          {
            "name": "Xã Trà Đốc",
            "code": "50327037"
          },
          {
            "name": "Xã Trà My",
            "code": "50327038"
          }
        ]
      },
      {
        "name": "Huyện Duy Xuyên",
        "code": "50311",
        "wards": [
          {
            "name": "Xã Duy Nghĩa",
            "code": "50311055"
          },
          {
            "name": "Xã Nam Phước",
            "code": "50311056"
          },
          {
            "name": "Xã Duy Xuyên",
            "code": "50311057"
          },
          {
            "name": "Xã Thu Bồn",
            "code": "50311058"
          }
        ]
      },
      {
        "name": "Huyện Đại Lộc",
        "code": "50307",
        "wards": [
          {
            "name": "Xã Đại Lộc",
            "code": "50307069"
          },
          {
            "name": "Xã Hà Nha",
            "code": "50307070"
          },
          {
            "name": "Xã Thượng Đức",
            "code": "50307071"
          },
          {
            "name": "Xã Vu Gia",
            "code": "50307072"
          },
          {
            "name": "Xã Phú Thuận",
            "code": "50307073"
          }
        ]
      },
      {
        "name": "Huyện đảo Hoàng Sa",
        "code": "50113",
        "wards": [
          {
            "name": "Đặc khu Hoàng Sa",
            "code": "50113016"
          }
        ]
      },
      {
        "name": "Huyện Đông Giang",
        "code": "50305",
        "wards": [
          {
            "name": "Xã Sông Vàng",
            "code": "50305080"
          },
          {
            "name": "Xã Sông Kôn",
            "code": "50305081"
          },
          {
            "name": "Xã Đông Giang",
            "code": "50305082"
          },
          {
            "name": "Xã Bến Hiên",
            "code": "50305083"
          }
        ]
      },
      {
        "name": "Huyện Hiệp Đức",
        "code": "50319",
        "wards": [
          {
            "name": "Xã Hiệp Đức",
            "code": "50319087"
          },
          {
            "name": "Xã Việt An",
            "code": "50319088"
          },
          {
            "name": "Xã Phước Trà",
            "code": "50319089"
          }
        ]
      },
      {
        "name": "Huyện Hoà Vang",
        "code": "50111",
        "wards": [
          {
            "name": "Phường Hoà Xuân",
            "code": "50111012"
          },
          {
            "name": "Xã Hoà Vang",
            "code": "50111013"
          },
          {
            "name": "Xã Hoà Tiến",
            "code": "50111014"
          },
          {
            "name": "Xã Bà Nà",
            "code": "50111015"
          }
        ]
      },
      {
        "name": "Huyện Nam Giang",
        "code": "50313",
        "wards": [
          {
            "name": "Xã Thạnh Mỹ",
            "code": "50313074"
          },
          {
            "name": "Xã Bến Giằng",
            "code": "50313075"
          },
          {
            "name": "Xã Nam Giang",
            "code": "50313076"
          },
          {
            "name": "Xã Đắc Pring",
            "code": "50313077"
          },
          {
            "name": "Xã La Dêê",
            "code": "50313078"
          },
          {
            "name": "Xã La Êê",
            "code": "50313079"
          }
        ]
      },
      {
        "name": "Huyện Nam Trà My",
        "code": "50329",
        "wards": [
          {
            "name": "Xã Nam Trà My",
            "code": "50329039"
          },
          {
            "name": "Xã Trà Tập",
            "code": "50329040"
          },
          {
            "name": "Xã Trà Vân",
            "code": "50329041"
          },
          {
            "name": "Xã Trà Linh",
            "code": "50329042"
          },
          {
            "name": "Xã Trà Leng",
            "code": "50329043"
          }
        ]
      },
      {
        "name": "Huyện Núi Thành",
        "code": "50325",
        "wards": [
          {
            "name": "Xã Núi Thành",
            "code": "50325017"
          },
          {
            "name": "Xã Tam Mỹ",
            "code": "50325018"
          },
          {
            "name": "Xã Tam Anh",
            "code": "50325019"
          },
          {
            "name": "Xã Đức Phú",
            "code": "50325020"
          },
          {
            "name": "Xã Tam Xuân",
            "code": "50325021"
          },
          {
            "name": "Xã Tam Hải",
            "code": "50325022"
          }
        ]
      },
      {
        "name": "Huyện Phú Ninh",
        "code": "50302",
        "wards": [
          {
            "name": "Xã Tây Hồ",
            "code": "50302027"
          },
          {
            "name": "Xã Chiên Đàn",
            "code": "50302028"
          },
          {
            "name": "Xã Phú Ninh",
            "code": "50302029"
          }
        ]
      },
      {
        "name": "Huyện Phước Sơn",
        "code": "50323",
        "wards": [
          {
            "name": "Xã Khâm Đức",
            "code": "50323090"
          },
          {
            "name": "Xã Phước Năng",
            "code": "50323091"
          },
          {
            "name": "Xã Phước Chánh",
            "code": "50323092"
          },
          {
            "name": "Xã Phước Thành",
            "code": "50323093"
          },
          {
            "name": "Xã Phước Hiệp",
            "code": "50323094"
          }
        ]
      },
      {
        "name": "Huyện Quế Sơn",
        "code": "50317",
        "wards": [
          {
            "name": "Xã Quế Sơn Trung",
            "code": "50317050"
          },
          {
            "name": "Xã Quế Sơn",
            "code": "50317051"
          },
          {
            "name": "Xã Xuân Phú",
            "code": "50317052"
          },
          {
            "name": "Xã Nông Sơn",
            "code": "50317053"
          },
          {
            "name": "Xã Quế Phước",
            "code": "50317054"
          }
        ]
      },
      {
        "name": "Huyện Tây Giang",
        "code": "50304",
        "wards": [
          {
            "name": "Xã Avương",
            "code": "50304084"
          },
          {
            "name": "Xã Tây Giang",
            "code": "50304085"
          },
          {
            "name": "Xã Hùng Sơn",
            "code": "50304086"
          }
        ]
      },
      {
        "name": "Huyện Thăng Bình",
        "code": "50315",
        "wards": [
          {
            "name": "Xã Thăng Bình",
            "code": "50315044"
          },
          {
            "name": "Xã Thăng An",
            "code": "50315045"
          },
          {
            "name": "Xã Thăng Trường",
            "code": "50315046"
          },
          {
            "name": "Xã Thăng Điền",
            "code": "50315047"
          },
          {
            "name": "Xã Thăng Phú",
            "code": "50315048"
          },
          {
            "name": "Xã Đồng Dương",
            "code": "50315049"
          }
        ]
      },
      {
        "name": "Huyện Tiên Phước",
        "code": "50321",
        "wards": [
          {
            "name": "Xã Lãnh Ngọc",
            "code": "50321030"
          },
          {
            "name": "Xã Tiên Phước",
            "code": "50321031"
          },
          {
            "name": "Xã Thạnh Bình",
            "code": "50321032"
          },
          {
            "name": "Xã Sơn Cẩm Hà",
            "code": "50321033"
          }
        ]
      },
      {
        "name": "Quận Cẩm Lệ",
        "code": "50115",
        "wards": [
          {
            "name": "Phường An Khê",
            "code": "50115004"
          },
          {
            "name": "Phường Cẩm Lệ",
            "code": "50115011"
          }
        ]
      },
      {
        "name": "Quận Hải Châu",
        "code": "50101",
        "wards": [
          {
            "name": "Phường Hải Châu",
            "code": "50101001"
          },
          {
            "name": "Phường Hoà Cường",
            "code": "50101002"
          }
        ]
      },
      {
        "name": "Quận Liên Chiểu",
        "code": "50109",
        "wards": [
          {
            "name": "Phường Hoà Khánh",
            "code": "50109008"
          },
          {
            "name": "Phường Hải Vân",
            "code": "50109009"
          },
          {
            "name": "Phường Liên Chiểu",
            "code": "50109010"
          }
        ]
      },
      {
        "name": "Quận Ngũ Hành Sơn",
        "code": "50107",
        "wards": [
          {
            "name": "Phường Ngũ Hành Sơn",
            "code": "50107007"
          }
        ]
      },
      {
        "name": "Quận Sơn Trà",
        "code": "50105",
        "wards": [
          {
            "name": "Phường An Hải",
            "code": "50105005"
          },
          {
            "name": "Phường Sơn Trà",
            "code": "50105006"
          }
        ]
      },
      {
        "name": "Quận Thanh Khê",
        "code": "50103",
        "wards": [
          {
            "name": "Phường Thanh Khê",
            "code": "50103003"
          }
        ]
      },
      {
        "name": "Thành phố Hội An",
        "code": "50303",
        "wards": [
          {
            "name": "Phường Hội An",
            "code": "50303065"
          },
          {
            "name": "Phường Hội An Đông",
            "code": "50303066"
          },
          {
            "name": "Phường Hội An Tây",
            "code": "50303067"
          },
          {
            "name": "Xã Tân Hiệp",
            "code": "50303068"
          }
        ]
      },
      {
        "name": "Thành phố Tam Kỳ",
        "code": "50301",
        "wards": [
          {
            "name": "Phường Tam Kỳ",
            "code": "50301023"
          },
          {
            "name": "Phường Quảng Phú",
            "code": "50301024"
          },
          {
            "name": "Phường Hương Trà",
            "code": "50301025"
          },
          {
            "name": "Phường Bàn Thạch",
            "code": "50301026"
          }
        ]
      },
      {
        "name": "Thị xã Điện Bàn",
        "code": "50309",
        "wards": [
          {
            "name": "Phường Điện Bàn",
            "code": "50309059"
          },
          {
            "name": "Phường Điện Bàn Đông",
            "code": "50309060"
          },
          {
            "name": "Phường An Thắng",
            "code": "50309061"
          },
          {
            "name": "Phường Điện Bàn Bắc",
            "code": "50309062"
          },
          {
            "name": "Xã Điện Bàn Tây",
            "code": "50309063"
          },
          {
            "name": "Xã Gò Nổi",
            "code": "50309064"
          }
        ]
      }
    ]
  },
  {
    "name": "Tp Hải Phòng",
    "code": "04",
    "districts": [
      {
        "name": "Huyện An Lão",
        "code": "10315",
        "wards": [
          {
            "name": "Xã An Hưng",
            "code": "10315025"
          },
          {
            "name": "Xã An Khánh",
            "code": "10315026"
          },
          {
            "name": "Xã An Quang",
            "code": "10315027"
          },
          {
            "name": "Xã An Trường",
            "code": "10315028"
          },
          {
            "name": "Xã An Lão",
            "code": "10315029"
          }
        ]
      },
      {
        "name": "Huyện Bạch Long Vĩ",
        "code": "10325",
        "wards": [
          {
            "name": "Đặc khu Bạch Long Vĩ",
            "code": "10325050"
          }
        ]
      },
      {
        "name": "Huyện Bình Giang",
        "code": "10719",
        "wards": [
          {
            "name": "Xã Kẻ Sặt",
            "code": "10719087"
          },
          {
            "name": "Xã Bình Giang",
            "code": "10719088"
          },
          {
            "name": "Xã Đường An",
            "code": "10719089"
          },
          {
            "name": "Xã Thượng Hồng",
            "code": "10719090"
          }
        ]
      },
      {
        "name": "Huyện Cát Hải",
        "code": "10323",
        "wards": [
          {
            "name": "Đặc khu Cát Hải",
            "code": "10323049"
          }
        ]
      },
      {
        "name": "Huyện Cẩm Giàng",
        "code": "10717",
        "wards": [
          {
            "name": "Phường Tứ Minh",
            "code": "10717058"
          },
          {
            "name": "Xã Cẩm Giang",
            "code": "10717083"
          },
          {
            "name": "Xã Tuệ Tĩnh",
            "code": "10717084"
          },
          {
            "name": "Xã Mao Điền",
            "code": "10717085"
          },
          {
            "name": "Xã Cẩm Giàng",
            "code": "10717086"
          }
        ]
      },
      {
        "name": "Huyện Gia Lộc",
        "code": "10713",
        "wards": [
          {
            "name": "Xã Gia Lộc",
            "code": "10713091"
          },
          {
            "name": "Xã Yết Kiêu",
            "code": "10713092"
          },
          {
            "name": "Xã Gia Phúc",
            "code": "10713093"
          },
          {
            "name": "Xã Trường Tân",
            "code": "10713094"
          }
        ]
      },
      {
        "name": "Huyện Kiến Thụy",
        "code": "10317",
        "wards": [
          {
            "name": "Xã Kiến Thụy",
            "code": "10317030"
          },
          {
            "name": "Xã Kiến Minh",
            "code": "10317031"
          },
          {
            "name": "Xã Kiến Hải",
            "code": "10317032"
          },
          {
            "name": "Xã Kiến Hưng",
            "code": "10317033"
          },
          {
            "name": "Xã Nghi Dương",
            "code": "10317034"
          }
        ]
      },
      {
        "name": "Huyện Kim Thành",
        "code": "10711",
        "wards": [
          {
            "name": "Xã Phú Thái",
            "code": "10711111"
          },
          {
            "name": "Xã Lai Khê",
            "code": "10711112"
          },
          {
            "name": "Xã An Thành",
            "code": "10711113"
          },
          {
            "name": "Xã Kim Thành",
            "code": "10711114"
          }
        ]
      },
      {
        "name": "Huyện Nam Sách",
        "code": "10705",
        "wards": [
          {
            "name": "Xã Nam Sách",
            "code": "10705073"
          },
          {
            "name": "Xã Thái Tân",
            "code": "10705074"
          },
          {
            "name": "Xã Hợp Tiến",
            "code": "10705075"
          },
          {
            "name": "Xã Trần Phú",
            "code": "10705076"
          },
          {
            "name": "Xã An Phú",
            "code": "10705077"
          }
        ]
      },
      {
        "name": "Huyện Ninh Giang",
        "code": "10723",
        "wards": [
          {
            "name": "Xã Ninh Giang",
            "code": "10723101"
          },
          {
            "name": "Xã Vĩnh Lại",
            "code": "10723102"
          },
          {
            "name": "Xã Khúc Thừa Dụ",
            "code": "10723103"
          },
          {
            "name": "Xã Tân An",
            "code": "10723104"
          },
          {
            "name": "Xã Hồng Châu",
            "code": "10723105"
          }
        ]
      },
      {
        "name": "Huyện Thanh Hà",
        "code": "10707",
        "wards": [
          {
            "name": "Xã Thanh Hà",
            "code": "10707078"
          },
          {
            "name": "Xã Hà Tây",
            "code": "10707079"
          },
          {
            "name": "Xã Hà Bắc",
            "code": "10707080"
          },
          {
            "name": "Xã Hà Nam",
            "code": "10707081"
          },
          {
            "name": "Xã Hà Đông",
            "code": "10707082"
          }
        ]
      },
      {
        "name": "Huyện Thanh Miện",
        "code": "10721",
        "wards": [
          {
            "name": "Xã Thanh Miện",
            "code": "10721106"
          },
          {
            "name": "Xã Bắc Thanh Miện",
            "code": "10721107"
          },
          {
            "name": "Xã Hải Hưng",
            "code": "10721108"
          },
          {
            "name": "Xã Nguyễn Lương Bằng",
            "code": "10721109"
          },
          {
            "name": "Xã Nam Thanh Miện",
            "code": "10721110"
          }
        ]
      },
      {
        "name": "Huyện Tiên Lãng",
        "code": "10319",
        "wards": [
          {
            "name": "Xã Quyết Thắng",
            "code": "10319035"
          },
          {
            "name": "Xã Tiên Lãng",
            "code": "10319036"
          },
          {
            "name": "Xã Tân Minh",
            "code": "10319037"
          },
          {
            "name": "Xã Tiên Minh",
            "code": "10319038"
          },
          {
            "name": "Xã Chấn Hưng",
            "code": "10319039"
          },
          {
            "name": "Xã Hùng Thắng",
            "code": "10319040"
          }
        ]
      },
      {
        "name": "Huyện Tứ Kỳ",
        "code": "10715",
        "wards": [
          {
            "name": "Xã Tứ Kỳ",
            "code": "10715095"
          },
          {
            "name": "Xã Tân Kỳ",
            "code": "10715096"
          },
          {
            "name": "Xã Đại Sơn",
            "code": "10715097"
          },
          {
            "name": "Xã Chí Minh",
            "code": "10715098"
          },
          {
            "name": "Xã Lạc Phượng",
            "code": "10715099"
          },
          {
            "name": "Xã Nguyên Giáp",
            "code": "10715100"
          }
        ]
      },
      {
        "name": "Huyện Vĩnh Bảo",
        "code": "10321",
        "wards": [
          {
            "name": "Xã Vĩnh Bảo",
            "code": "10321041"
          },
          {
            "name": "Xã Nguyễn Bỉnh Khiêm",
            "code": "10321042"
          },
          {
            "name": "Xã Vĩnh Am",
            "code": "10321043"
          },
          {
            "name": "Xã Vĩnh Hải",
            "code": "10321044"
          },
          {
            "name": "Xã Vĩnh Hoà",
            "code": "10321045"
          },
          {
            "name": "Xã Vĩnh Thịnh",
            "code": "10321046"
          },
          {
            "name": "Xã Vĩnh Thuận",
            "code": "10321047"
          }
        ]
      },
      {
        "name": "Quận An Dương",
        "code": "10313",
        "wards": [
          {
            "name": "Phường An Dương",
            "code": "10313022"
          },
          {
            "name": "Phường An Hải",
            "code": "10313023"
          },
          {
            "name": "Phường An Phong",
            "code": "10313024"
          }
        ]
      },
      {
        "name": "Quận Dương Kinh",
        "code": "10327",
        "wards": [
          {
            "name": "Phường Hưng Đạo",
            "code": "10327020"
          },
          {
            "name": "Phường Dương Kinh",
            "code": "10327021"
          }
        ]
      },
      {
        "name": "Quận Đồ Sơn",
        "code": "10309",
        "wards": [
          {
            "name": "Phường Nam Đồ Sơn",
            "code": "10309018"
          },
          {
            "name": "Phường Đồ Sơn",
            "code": "10309019"
          }
        ]
      },
      {
        "name": "Quận Hải An",
        "code": "10304",
        "wards": [
          {
            "name": "Phường Hải An",
            "code": "10304014"
          },
          {
            "name": "Phường Đông Hải",
            "code": "10304015"
          }
        ]
      },
      {
        "name": "Quận Hồng Bàng",
        "code": "10301",
        "wards": [
          {
            "name": "Phường Hồng Bàng",
            "code": "10301008"
          },
          {
            "name": "Phường Hồng An",
            "code": "10301009"
          }
        ]
      },
      {
        "name": "Quận Kiến An",
        "code": "10307",
        "wards": [
          {
            "name": "Phường Kiến An",
            "code": "10307016"
          },
          {
            "name": "Phường Phù Liễn",
            "code": "10307017"
          }
        ]
      },
      {
        "name": "Quận Lê Chân",
        "code": "10305",
        "wards": [
          {
            "name": "Phường Lê Chân",
            "code": "10305012"
          },
          {
            "name": "Phường An Biên",
            "code": "10305013"
          }
        ]
      },
      {
        "name": "Quận Ngô Quyền",
        "code": "10303",
        "wards": [
          {
            "name": "Phường Ngô Quyền",
            "code": "10303010"
          },
          {
            "name": "Phường Gia Viên",
            "code": "10303011"
          }
        ]
      },
      {
        "name": "Thành phố Chí Linh",
        "code": "10703",
        "wards": [
          {
            "name": "Phường Chu Văn An",
            "code": "10703060"
          },
          {
            "name": "Phường Chí Linh",
            "code": "10703061"
          },
          {
            "name": "Phường Trần Hưng Đạo",
            "code": "10703062"
          },
          {
            "name": "Phường Nguyễn Trãi",
            "code": "10703063"
          },
          {
            "name": "Phường Trần Nhân Tông",
            "code": "10703064"
          },
          {
            "name": "Phường Lê Đại Hành",
            "code": "10703065"
          }
        ]
      },
      {
        "name": "Thành phố Hải Dương",
        "code": "10701",
        "wards": [
          {
            "name": "Phường Hải Dương",
            "code": "10701051"
          },
          {
            "name": "Phường Lê Thanh Nghị",
            "code": "10701052"
          },
          {
            "name": "Phường Việt Hoà",
            "code": "10701053"
          },
          {
            "name": "Phường Thành Đông",
            "code": "10701054"
          },
          {
            "name": "Phường Nam Đồng",
            "code": "10701055"
          },
          {
            "name": "Phường Tân Hưng",
            "code": "10701056"
          },
          {
            "name": "Phường Thạch Khôi",
            "code": "10701057"
          },
          {
            "name": "Phường Ái Quốc",
            "code": "10701059"
          }
        ]
      },
      {
        "name": "Thành phố Thuỷ Nguyên",
        "code": "10311",
        "wards": [
          {
            "name": "Phường Thuỷ Nguyên",
            "code": "10311001"
          },
          {
            "name": "Phường Thiên Hương",
            "code": "10311002"
          },
          {
            "name": "Phường Hoà Bình",
            "code": "10311003"
          },
          {
            "name": "Phường Nam Triệu",
            "code": "10311004"
          },
          {
            "name": "Phường Bạch Đằng",
            "code": "10311005"
          },
          {
            "name": "Phường Lưu Kiếm",
            "code": "10311006"
          },
          {
            "name": "Phường Lê Ích Mộc",
            "code": "10311007"
          },
          {
            "name": "Xã Việt Khê",
            "code": "10311048"
          }
        ]
      },
      {
        "name": "Thị xã Kinh Môn",
        "code": "10709",
        "wards": [
          {
            "name": "Phường Kinh Môn",
            "code": "10709066"
          },
          {
            "name": "Phường Nguyễn Đại Năng",
            "code": "10709067"
          },
          {
            "name": "Phường Trần Liễu",
            "code": "10709068"
          },
          {
            "name": "Phường Bắc An Phụ",
            "code": "10709069"
          },
          {
            "name": "Phường Phạm Sư Mạnh",
            "code": "10709070"
          },
          {
            "name": "Phường Nhị Chiểu",
            "code": "10709071"
          },
          {
            "name": "Xã Nam An Phụ",
            "code": "10709072"
          }
        ]
      }
    ]
  },
  {
    "name": "Tp Hồ Chí Minh",
    "code": "29",
    "districts": [
      {
        "name": "Huyện Bàu Bàng",
        "code": "71115",
        "wards": [
          {
            "name": "Phường Long Nguyên",
            "code": "71115048"
          },
          {
            "name": "Phường Bến Cát",
            "code": "71115049"
          },
          {
            "name": "Phường Chánh Phú Hoà",
            "code": "71115050"
          },
          {
            "name": "Xã Trừ Văn Thố",
            "code": "71115057"
          },
          {
            "name": "Xã Bàu Bàng",
            "code": "71115058"
          }
        ]
      },
      {
        "name": "Huyện Bắc Tân Uyên",
        "code": "71117",
        "wards": [
          {
            "name": "Xã Bắc Tân Uyên",
            "code": "71117051"
          },
          {
            "name": "Xã Thường Tân",
            "code": "71117052"
          }
        ]
      },
      {
        "name": "Huyện Bình Chánh",
        "code": "70139",
        "wards": [
          {
            "name": "Xã Vĩnh Lộc",
            "code": "70139141"
          },
          {
            "name": "Xã Tân Vĩnh Lộc",
            "code": "70139142"
          },
          {
            "name": "Xã Bình Lợi",
            "code": "70139143"
          },
          {
            "name": "Xã Tân Nhựt",
            "code": "70139144"
          },
          {
            "name": "Xã Bình Chánh",
            "code": "70139145"
          },
          {
            "name": "Xã Hưng Long",
            "code": "70139146"
          },
          {
            "name": "Xã Bình Hưng",
            "code": "70139147"
          }
        ]
      },
      {
        "name": "Huyện Cần Giờ",
        "code": "70143",
        "wards": [
          {
            "name": "Xã Bình Khánh",
            "code": "70143148"
          },
          {
            "name": "Xã An Thới Đông",
            "code": "70143149"
          },
          {
            "name": "Xã Cần Giờ",
            "code": "70143150"
          },
          {
            "name": "Xã Thạnh An",
            "code": "70143168"
          }
        ]
      },
      {
        "name": "Huyện Châu Đức",
        "code": "71705",
        "wards": [
          {
            "name": "Xã Ngãi Giao",
            "code": "71705013"
          },
          {
            "name": "Xã Bình Giã",
            "code": "71705014"
          },
          {
            "name": "Xã Kim Long",
            "code": "71705015"
          },
          {
            "name": "Xã Châu Đức",
            "code": "71705016"
          },
          {
            "name": "Xã Xuân Sơn",
            "code": "71705017"
          },
          {
            "name": "Xã Nghĩa Thành",
            "code": "71705018"
          }
        ]
      },
      {
        "name": "Huyện Côn Đảo",
        "code": "71713",
        "wards": [
          {
            "name": "Đặc khu Côn Đảo",
            "code": "71713027"
          }
        ]
      },
      {
        "name": "Huyện Củ Chi",
        "code": "70135",
        "wards": [
          {
            "name": "Xã Củ Chi",
            "code": "70135151"
          },
          {
            "name": "Xã Tân An Hội",
            "code": "70135152"
          },
          {
            "name": "Xã Thái Mỹ",
            "code": "70135153"
          },
          {
            "name": "Xã An Nhơn Tây",
            "code": "70135154"
          },
          {
            "name": "Xã Nhuận Đức",
            "code": "70135155"
          },
          {
            "name": "Xã Phú Hoà Đông",
            "code": "70135156"
          },
          {
            "name": "Xã Bình Mỹ",
            "code": "70135157"
          }
        ]
      },
      {
        "name": "Huyện Dầu Tiếng",
        "code": "71113",
        "wards": [
          {
            "name": "Phường Tây Nam",
            "code": "71113047"
          },
          {
            "name": "Xã Minh Thạnh",
            "code": "71113059"
          },
          {
            "name": "Xã Long Hoà",
            "code": "71113060"
          },
          {
            "name": "Xã Dầu Tiếng",
            "code": "71113061"
          },
          {
            "name": "Xã Thanh An",
            "code": "71113062"
          }
        ]
      },
      {
        "name": "Huyện Hóc Môn",
        "code": "70137",
        "wards": [
          {
            "name": "Xã Đông Thạnh",
            "code": "70137158"
          },
          {
            "name": "Xã Hóc Môn",
            "code": "70137159"
          },
          {
            "name": "Xã Xuân Thới Sơn",
            "code": "70137160"
          },
          {
            "name": "Xã Bà Điểm",
            "code": "70137161"
          }
        ]
      },
      {
        "name": "Huyện Long Đất",
        "code": "71712",
        "wards": [
          {
            "name": "Xã Phước Hải",
            "code": "71712023"
          },
          {
            "name": "Xã Long Hải",
            "code": "71712024"
          },
          {
            "name": "Xã Đất Đỏ",
            "code": "71712025"
          },
          {
            "name": "Xã Long Điền",
            "code": "71712026"
          }
        ]
      },
      {
        "name": "Huyện Nhà Bè",
        "code": "70141",
        "wards": [
          {
            "name": "Xã Nhà Bè",
            "code": "70141162"
          },
          {
            "name": "Xã Hiệp Phước",
            "code": "70141163"
          }
        ]
      },
      {
        "name": "Huyện Phú Giáo",
        "code": "71111",
        "wards": [
          {
            "name": "Xã An Long",
            "code": "71111053"
          },
          {
            "name": "Xã Phước Thành",
            "code": "71111054"
          },
          {
            "name": "Xã Phước Hoà",
            "code": "71111055"
          },
          {
            "name": "Xã Phú Giáo",
            "code": "71111056"
          }
        ]
      },
      {
        "name": "Huyện Xuyên Mộc",
        "code": "71707",
        "wards": [
          {
            "name": "Xã Hồ Tràm",
            "code": "71707019"
          },
          {
            "name": "Xã Xuyên Mộc",
            "code": "71707020"
          },
          {
            "name": "Xã Hòa Hội",
            "code": "71707021"
          },
          {
            "name": "Xã Bàu Lâm",
            "code": "71707022"
          },
          {
            "name": "Xã Hòa Hiệp",
            "code": "71707165"
          },
          {
            "name": "Xã Bình Châu",
            "code": "71707166"
          }
        ]
      },
      {
        "name": "Quận 1",
        "code": "70101",
        "wards": [
          {
            "name": "Phường Sài Gòn",
            "code": "70101063"
          },
          {
            "name": "Phường Tân Định",
            "code": "70101064"
          },
          {
            "name": "Phường Bến Thành",
            "code": "70101065"
          },
          {
            "name": "Phường Cầu Ông Lãnh",
            "code": "70101066"
          }
        ]
      },
      {
        "name": "Quận 10",
        "code": "70119",
        "wards": [
          {
            "name": "Phường Diên Hồng",
            "code": "70119087"
          },
          {
            "name": "Phường Vườn Lài",
            "code": "70119088"
          },
          {
            "name": "Phường Hoà Hưng",
            "code": "70119089"
          }
        ]
      },
      {
        "name": "Quận 11",
        "code": "70121",
        "wards": [
          {
            "name": "Phường Minh Phụng",
            "code": "70121090"
          },
          {
            "name": "Phường Bình Thới",
            "code": "70121091"
          },
          {
            "name": "Phường Hoà Bình",
            "code": "70121092"
          },
          {
            "name": "Phường Phú Thọ",
            "code": "70121093"
          }
        ]
      },
      {
        "name": "Quận 12",
        "code": "70123",
        "wards": [
          {
            "name": "Phường Đông Hưng Thuận",
            "code": "70123094"
          },
          {
            "name": "Phường Trung Mỹ Tây",
            "code": "70123095"
          },
          {
            "name": "Phường Tân Thới Hiệp",
            "code": "70123096"
          },
          {
            "name": "Phường Thới An",
            "code": "70123097"
          },
          {
            "name": "Phường An Phú Đông",
            "code": "70123098"
          }
        ]
      },
      {
        "name": "Quận 3",
        "code": "70105",
        "wards": [
          {
            "name": "Phường Bàn Cờ",
            "code": "70105067"
          },
          {
            "name": "Phường Xuân Hoà",
            "code": "70105068"
          },
          {
            "name": "Phường Nhiêu Lộc",
            "code": "70105069"
          }
        ]
      },
      {
        "name": "Quận 4",
        "code": "70107",
        "wards": [
          {
            "name": "Phường Xóm Chiếu",
            "code": "70107070"
          },
          {
            "name": "Phường Khánh Hội",
            "code": "70107071"
          },
          {
            "name": "Phường Vĩnh Hội",
            "code": "70107072"
          }
        ]
      },
      {
        "name": "Quận 5",
        "code": "70109",
        "wards": [
          {
            "name": "Phường Chợ Quán",
            "code": "70109073"
          },
          {
            "name": "Phường An Đông",
            "code": "70109074"
          },
          {
            "name": "Phường Chợ Lớn",
            "code": "70109075"
          }
        ]
      },
      {
        "name": "Quận 6",
        "code": "70111",
        "wards": [
          {
            "name": "Phường Bình Tây",
            "code": "70111076"
          },
          {
            "name": "Phường Bình Tiên",
            "code": "70111077"
          },
          {
            "name": "Phường Bình Phú",
            "code": "70111078"
          },
          {
            "name": "Phường Phú Lâm",
            "code": "70111079"
          }
        ]
      },
      {
        "name": "Quận 7",
        "code": "70113",
        "wards": [
          {
            "name": "Phường Tân Thuận",
            "code": "70113080"
          },
          {
            "name": "Phường Phú Thuận",
            "code": "70113081"
          },
          {
            "name": "Phường Tân Mỹ",
            "code": "70113082"
          },
          {
            "name": "Phường Tân Hưng",
            "code": "70113083"
          }
        ]
      },
      {
        "name": "Quận 8",
        "code": "70115",
        "wards": [
          {
            "name": "Phường Chánh Hưng",
            "code": "70115084"
          },
          {
            "name": "Phường Phú Định",
            "code": "70115085"
          },
          {
            "name": "Phường Bình Đông",
            "code": "70115086"
          }
        ]
      },
      {
        "name": "Quận Bình Tân",
        "code": "70134",
        "wards": [
          {
            "name": "Phường An Lạc",
            "code": "70134099"
          },
          {
            "name": "Phường Tân Tạo",
            "code": "70134100"
          },
          {
            "name": "Phường Bình Tân",
            "code": "70134101"
          },
          {
            "name": "Phường Bình Trị Đông",
            "code": "70134102"
          },
          {
            "name": "Phường Bình Hưng Hoà",
            "code": "70134103"
          }
        ]
      },
      {
        "name": "Quận Bình Thạnh",
        "code": "70129",
        "wards": [
          {
            "name": "Phường Gia Định",
            "code": "70129104"
          },
          {
            "name": "Phường Bình Thạnh",
            "code": "70129105"
          },
          {
            "name": "Phường Bình Lợi Trung",
            "code": "70129106"
          },
          {
            "name": "Phường Thạnh Mỹ Tây",
            "code": "70129107"
          },
          {
            "name": "Phường Bình Quới",
            "code": "70129108"
          }
        ]
      },
      {
        "name": "Quận Gò Vấp",
        "code": "70125",
        "wards": [
          {
            "name": "Phường Hạnh Thông",
            "code": "70125109"
          },
          {
            "name": "Phường An Nhơn",
            "code": "70125110"
          },
          {
            "name": "Phường Gò Vấp",
            "code": "70125111"
          },
          {
            "name": "Phường An Hội Đông",
            "code": "70125112"
          },
          {
            "name": "Phường Thông Tây Hội",
            "code": "70125113"
          },
          {
            "name": "Phường An Hội Tây",
            "code": "70125114"
          }
        ]
      },
      {
        "name": "Quận Phú Nhuận",
        "code": "70131",
        "wards": [
          {
            "name": "Phường Đức Nhuận",
            "code": "70131115"
          },
          {
            "name": "Phường Cầu Kiệu",
            "code": "70131116"
          },
          {
            "name": "Phường Phú Nhuận",
            "code": "70131117"
          }
        ]
      },
      {
        "name": "Quận Tân Bình",
        "code": "70127",
        "wards": [
          {
            "name": "Phường Tân Sơn Hoà",
            "code": "70127118"
          },
          {
            "name": "Phường Tân Sơn Nhất",
            "code": "70127119"
          },
          {
            "name": "Phường Tân Hoà",
            "code": "70127120"
          },
          {
            "name": "Phường Bảy Hiền",
            "code": "70127121"
          },
          {
            "name": "Phường Tân Bình",
            "code": "70127122"
          },
          {
            "name": "Phường Tân Sơn",
            "code": "70127123"
          }
        ]
      },
      {
        "name": "Quận Tân Phú",
        "code": "70128",
        "wards": [
          {
            "name": "Phường Tây Thạnh",
            "code": "70128124"
          },
          {
            "name": "Phường Tân Sơn Nhì",
            "code": "70128125"
          },
          {
            "name": "Phường Phú Thọ Hoà",
            "code": "70128126"
          },
          {
            "name": "Phường Tân Phú",
            "code": "70128127"
          },
          {
            "name": "Phường Phú Thạnh",
            "code": "70128128"
          }
        ]
      },
      {
        "name": "Thành phố Bà Rịa",
        "code": "71703",
        "wards": [
          {
            "name": "Phường Bà Rịa",
            "code": "71703005"
          },
          {
            "name": "Phường Long Hương",
            "code": "71703006"
          },
          {
            "name": "Phường Tam Long",
            "code": "71703008"
          }
        ]
      },
      {
        "name": "Thành phố Bến Cát",
        "code": "71103",
        "wards": [
          {
            "name": "Phường Hoà Lợi",
            "code": "71103045"
          },
          {
            "name": "Phường Thới Hoà",
            "code": "71103167"
          }
        ]
      },
      {
        "name": "Thành phố Dĩ An",
        "code": "71109",
        "wards": [
          {
            "name": "Phường Đông Hoà",
            "code": "71109028"
          },
          {
            "name": "Phường Dĩ An",
            "code": "71109029"
          },
          {
            "name": "Phường Tân Đông Hiệp",
            "code": "71109030"
          }
        ]
      },
      {
        "name": "Thành phố Phú Mỹ",
        "code": "71709",
        "wards": [
          {
            "name": "Phường Phú Mỹ",
            "code": "71709007"
          },
          {
            "name": "Phường Tân Thành",
            "code": "71709009"
          },
          {
            "name": "Phường Tân Phước",
            "code": "71709010"
          },
          {
            "name": "Phường Tân Hải",
            "code": "71709011"
          },
          {
            "name": "Xã Châu Pha",
            "code": "71709012"
          }
        ]
      },
      {
        "name": "Thành phố Tân Uyên",
        "code": "71105",
        "wards": [
          {
            "name": "Phường Vĩnh Tân",
            "code": "71105040"
          },
          {
            "name": "Phường Bình Cơ",
            "code": "71105041"
          },
          {
            "name": "Phường Tân Uyên",
            "code": "71105042"
          },
          {
            "name": "Phường Tân Hiệp",
            "code": "71105043"
          },
          {
            "name": "Phường Tân Khánh",
            "code": "71105044"
          }
        ]
      },
      {
        "name": "Thành phố Thủ Dầu Một",
        "code": "71101",
        "wards": [
          {
            "name": "Phường Bình Dương",
            "code": "71101036"
          },
          {
            "name": "Phường Chánh Hiệp",
            "code": "71101037"
          },
          {
            "name": "Phường Thủ Dầu Một",
            "code": "71101038"
          },
          {
            "name": "Phường Phú Lợi",
            "code": "71101039"
          },
          {
            "name": "Phường Phú An",
            "code": "71101046"
          }
        ]
      },
      {
        "name": "Thành phố Thủ Đức",
        "code": "70145",
        "wards": [
          {
            "name": "Phường Hiệp Bình",
            "code": "70145129"
          },
          {
            "name": "Phường Thủ Đức",
            "code": "70145130"
          },
          {
            "name": "Phường Tam Bình",
            "code": "70145131"
          },
          {
            "name": "Phường Linh Xuân",
            "code": "70145132"
          },
          {
            "name": "Phường Tăng Nhơn Phú",
            "code": "70145133"
          },
          {
            "name": "Phường Long Bình",
            "code": "70145134"
          },
          {
            "name": "Phường Long Phước",
            "code": "70145135"
          },
          {
            "name": "Phường Long Trường",
            "code": "70145136"
          },
          {
            "name": "Phường Cát Lái",
            "code": "70145137"
          },
          {
            "name": "Phường Bình Trưng",
            "code": "70145138"
          },
          {
            "name": "Phường Phước Long",
            "code": "70145139"
          },
          {
            "name": "Phường An Khánh",
            "code": "70145140"
          }
        ]
      },
      {
        "name": "Thành phố Thuận An",
        "code": "71107",
        "wards": [
          {
            "name": "Phường Thuận An",
            "code": "71107031"
          },
          {
            "name": "Phường Thuận Giao",
            "code": "71107032"
          },
          {
            "name": "Phường Bình Hoà",
            "code": "71107033"
          },
          {
            "name": "Phường Lái Thiêu",
            "code": "71107034"
          },
          {
            "name": "Phường An Phú",
            "code": "71107035"
          }
        ]
      },
      {
        "name": "Thành phố Vũng Tàu",
        "code": "71701",
        "wards": [
          {
            "name": "Phường Vũng Tàu",
            "code": "71701001"
          },
          {
            "name": "Phường Tam Thắng",
            "code": "71701002"
          },
          {
            "name": "Phường Rạch Dừa",
            "code": "71701003"
          },
          {
            "name": "Phường Phước Thắng",
            "code": "71701004"
          },
          {
            "name": "Xã Long Sơn",
            "code": "71701164"
          }
        ]
      }
    ]
  }
];

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
