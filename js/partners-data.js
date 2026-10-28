/* DEMO partner data — keep identical to data/partners.json.
   Used when the page is opened as a file (file://), where fetch of the JSON is blocked.
   Edit data/partners.json, then copy the object into this file. */
window.OKASTO_PARTNERS = {
  "_readme": "DEMO ONLY. Fake partner names, contract rates and website prices for the private booking links at /p/<partnerId>. Not real rates. Keep js/partners-data.js identical (window.OKASTO_PARTNERS = this object) so the pages still work when opened as files. type is \"agency\" or \"hotel\". creditEnabled partners see \"Book now, settle at month end (credit)\"; creditLimit (THB) is optional. publicRates are the public website prices used for \"Pay now via OKASTO payment (Beam), kickback at month end\". Commission = public − contract. history is example bookings for statementMonth. No Beam secrets belong in this file.",
  "currency": "THB",
  "statementMonth": "2026-10",
  "bookingEmail": "bookings@okasto.com",
  "vehicles": [
    {
      "id": "economy",
      "nameTh": "อีโคโนมี",
      "nameEn": "Economy",
      "nameZh": "经济型",
      "pax": 3,
      "bags": 2,
      "photo": "img/photos/fleet-economy.jpg"
    },
    {
      "id": "suv",
      "nameTh": "SUV",
      "nameEn": "SUV",
      "nameZh": "SUV",
      "pax": 4,
      "bags": 3,
      "photo": "img/photos/fleet-suv.jpg"
    },
    {
      "id": "van",
      "nameTh": "รถตู้",
      "nameEn": "Van",
      "nameZh": "面包车",
      "pax": 9,
      "bags": 8,
      "photo": "img/photos/fleet-van.jpg"
    }
  ],
  "routes": [
    {
      "id": "bkk-city",
      "regionTh": "กรุงเทพฯ",
      "regionEn": "Bangkok",
      "regionZh": "曼谷",
      "nameTh": "สุวรรณภูมิ (BKK) → ตัวเมืองกรุงเทพฯ",
      "nameEn": "Suvarnabhumi → Bangkok city",
      "nameZh": "素万那普 → 曼谷市区",
      "shortTh": "BKK → กรุงเทพฯ",
      "shortEn": "BKK → Bangkok",
      "shortZh": "BKK → 曼谷",
      "emailEn": "Suvarnabhumi (BKK) → Bangkok city"
    },
    {
      "id": "dmk-city",
      "regionTh": "กรุงเทพฯ",
      "regionEn": "Bangkok",
      "regionZh": "曼谷",
      "nameTh": "ดอนเมือง (DMK) → ตัวเมืองกรุงเทพฯ",
      "nameEn": "Don Mueang → Bangkok city",
      "nameZh": "廊曼 → 曼谷市区",
      "shortTh": "DMK → กรุงเทพฯ",
      "shortEn": "DMK → Bangkok",
      "shortZh": "DMK → 曼谷",
      "emailEn": "Don Mueang (DMK) → Bangkok city"
    },
    {
      "id": "bkk-pty",
      "regionTh": "พัทยา",
      "regionEn": "Pattaya",
      "regionZh": "芭堤雅",
      "nameTh": "สุวรรณภูมิ (BKK) → พัทยา",
      "nameEn": "Suvarnabhumi → Pattaya",
      "nameZh": "素万那普 → 芭堤雅",
      "shortTh": "BKK → พัทยา",
      "shortEn": "BKK → Pattaya",
      "shortZh": "BKK → 芭堤雅",
      "emailEn": "Suvarnabhumi (BKK) → Pattaya"
    },
    {
      "id": "dmk-pty",
      "regionTh": "พัทยา",
      "regionEn": "Pattaya",
      "regionZh": "芭堤雅",
      "nameTh": "ดอนเมือง (DMK) → พัทยา",
      "nameEn": "Don Mueang → Pattaya",
      "nameZh": "廊曼 → 芭堤雅",
      "shortTh": "DMK → พัทยา",
      "shortEn": "DMK → Pattaya",
      "shortZh": "DMK → 芭堤雅",
      "emailEn": "Don Mueang (DMK) → Pattaya"
    },
    {
      "id": "utp-pty",
      "regionTh": "พัทยา",
      "regionEn": "Pattaya",
      "regionZh": "芭堤雅",
      "nameTh": "อู่ตะเภา (UTP) → พัทยา",
      "nameEn": "U-Tapao → Pattaya",
      "nameZh": "乌塔保 → 芭堤雅",
      "shortTh": "UTP → พัทยา",
      "shortEn": "UTP → Pattaya",
      "shortZh": "UTP → 芭堤雅",
      "emailEn": "U-Tapao (UTP) → Pattaya"
    },
    {
      "id": "hkt-pat",
      "regionTh": "ภูเก็ต",
      "regionEn": "Phuket",
      "regionZh": "普吉",
      "nameTh": "ภูเก็ต (HKT) → ป่าตอง",
      "nameEn": "Phuket Airport → Patong",
      "nameZh": "普吉机场 → 芭东",
      "shortTh": "HKT → ป่าตอง",
      "shortEn": "HKT → Patong",
      "shortZh": "HKT → 芭东",
      "emailEn": "Phuket Airport (HKT) → Patong"
    }
  ],
  "partners": [
    {
      "id": "abc123",
      "type": "agency",
      "name": "Example Travel Co.",
      "creditEnabled": true,
      "creditLimit": 80000,
      "routeOrder": [
        "bkk-city",
        "dmk-city",
        "bkk-pty",
        "hkt-pat"
      ],
      "rates": {
        "bkk-city": {
          "economy": 750,
          "suv": 1050,
          "van": 1350
        },
        "dmk-city": {
          "economy": 700,
          "suv": 1000,
          "van": 1300
        },
        "bkk-pty": {
          "economy": 1250,
          "suv": 1650,
          "van": 1950
        },
        "hkt-pat": {
          "economy": 850,
          "suv": 1150,
          "van": 1450
        }
      },
      "publicRates": {
        "bkk-city": {
          "economy": 950,
          "suv": 1350,
          "van": 1750
        },
        "dmk-city": {
          "economy": 900,
          "suv": 1300,
          "van": 1700
        },
        "bkk-pty": {
          "economy": 1590,
          "suv": 2090,
          "van": 2490
        },
        "hkt-pat": {
          "economy": 1100,
          "suv": 1490,
          "van": 1890
        }
      },
      "sample": {
        "routeId": "bkk-pty",
        "vehicleId": "van",
        "date": "2026-10-30",
        "time": "10:30",
        "flight": "TG 661",
        "name": "Mr. John Example",
        "phone": "+66 80 000 0000",
        "pax": 6,
        "bags": 6,
        "notes": "ต้องการคาร์ซีทเด็ก 1 ตัว · 1 child seat needed. Guest stays at Example Beach Hotel, Pattaya.",
        "partnerRef": "EXT-2026-0042",
        "payment": "credit"
      },
      "history": [
        {
          "ref": "OK-P-4A11",
          "date": "2026-10-02",
          "time": "14:10",
          "flight": "TG 202",
          "routeId": "bkk-pty",
          "vehicleId": "van",
          "name": "Mr. John Example",
          "phone": "+66 80 000 0001",
          "pax": 7,
          "bags": 6,
          "notes": "Example credit booking.",
          "partnerRef": "EXT-2026-0018",
          "payment": "credit",
          "contract": 1950,
          "publicPrice": 2490,
          "commission": 0
        },
        {
          "ref": "OK-P-8C20",
          "date": "2026-10-11",
          "time": "11:40",
          "flight": "FD 3010",
          "routeId": "dmk-city",
          "vehicleId": "economy",
          "name": "Ms. Sara Example",
          "phone": "+66 80 000 0002",
          "pax": 2,
          "bags": 2,
          "notes": "Example paid booking.",
          "partnerRef": "EXT-2026-0024",
          "payment": "kickback",
          "contract": 700,
          "publicPrice": 900,
          "commission": 200
        },
        {
          "ref": "OK-P-2M55",
          "date": "2026-10-18",
          "time": "16:05",
          "flight": "TG 221",
          "routeId": "hkt-pat",
          "vehicleId": "suv",
          "name": "Mr. Ken Example",
          "phone": "+66 80 000 0003",
          "pax": 3,
          "bags": 3,
          "notes": "Example credit booking.",
          "partnerRef": "EXT-2026-0031",
          "payment": "credit",
          "contract": 1150,
          "publicPrice": 1490,
          "commission": 0
        },
        {
          "ref": "OK-P-9Q01",
          "date": "2026-10-24",
          "time": "09:20",
          "flight": "PG 800",
          "routeId": "bkk-city",
          "vehicleId": "van",
          "name": "Mrs. Lee Example",
          "phone": "+66 80 000 0004",
          "pax": 6,
          "bags": 5,
          "notes": "Example paid booking.",
          "partnerRef": "EXT-2026-0038",
          "payment": "kickback",
          "contract": 1350,
          "publicPrice": 1750,
          "commission": 400
        }
      ]
    },
    {
      "id": "pty201",
      "type": "hotel",
      "name": "Example Beach Hotel",
      "creditEnabled": false,
      "routeOrder": [
        "bkk-pty",
        "dmk-pty",
        "utp-pty",
        "bkk-city"
      ],
      "rates": {
        "bkk-pty": {
          "economy": 1100,
          "suv": 1480,
          "van": 1780
        },
        "dmk-pty": {
          "economy": 1200,
          "suv": 1580,
          "van": 1880
        },
        "utp-pty": {
          "economy": 620,
          "suv": 860,
          "van": 1120
        },
        "bkk-city": {
          "economy": 820,
          "suv": 1120,
          "van": 1420
        }
      },
      "publicRates": {
        "bkk-pty": {
          "economy": 1590,
          "suv": 2090,
          "van": 2490
        },
        "dmk-pty": {
          "economy": 1690,
          "suv": 2190,
          "van": 2590
        },
        "utp-pty": {
          "economy": 890,
          "suv": 1190,
          "van": 1490
        },
        "bkk-city": {
          "economy": 950,
          "suv": 1350,
          "van": 1750
        }
      },
      "sample": {
        "routeId": "bkk-pty",
        "vehicleId": "suv",
        "date": "2026-10-30",
        "time": "13:15",
        "flight": "TG 668",
        "name": "Ms. Anne Example",
        "phone": "+66 81 111 0000",
        "pax": 2,
        "bags": 2,
        "notes": "Guest of Example Beach Hotel. Please wait at arrivals with a name sign.",
        "partnerRef": "EBH-2026-118",
        "payment": "kickback"
      },
      "history": [
        {
          "ref": "OK-P-H101",
          "date": "2026-10-05",
          "time": "13:15",
          "flight": "TG 668",
          "routeId": "bkk-pty",
          "vehicleId": "suv",
          "name": "Mr. Paul Example",
          "phone": "+66 81 000 0101",
          "pax": 3,
          "bags": 2,
          "notes": "Example paid booking.",
          "partnerRef": "EBH-1042",
          "payment": "kickback",
          "contract": 1480,
          "publicPrice": 2090,
          "commission": 610
        },
        {
          "ref": "OK-P-H214",
          "date": "2026-10-14",
          "time": "10:00",
          "flight": "FD 3250",
          "routeId": "utp-pty",
          "vehicleId": "economy",
          "name": "Ms. Nina Example",
          "phone": "+66 81 000 0214",
          "pax": 1,
          "bags": 1,
          "notes": "Example paid booking.",
          "partnerRef": "EBH-1108",
          "payment": "kickback",
          "contract": 620,
          "publicPrice": 890,
          "commission": 270
        },
        {
          "ref": "OK-P-H330",
          "date": "2026-10-22",
          "time": "18:40",
          "flight": "SL 394",
          "routeId": "dmk-pty",
          "vehicleId": "van",
          "name": "Mr. Omar Example",
          "phone": "+66 81 000 0330",
          "pax": 8,
          "bags": 7,
          "notes": "Example paid booking.",
          "partnerRef": "EBH-1160",
          "payment": "kickback",
          "contract": 1880,
          "publicPrice": 2590,
          "commission": 710
        }
      ]
    }
  ]
};
