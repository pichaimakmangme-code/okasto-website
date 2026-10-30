# แผนผังเดโมจัดงานคนขับ

Example data only. These maps describe the browser demo in `dispatch/`. They are not linked from the public site.
Labels are Thai. English names are the screen names. Source files are the `.mmd` files in `dispatch/`.

## แผนผังหน้า

Sitemap by role. หน้าเดโม สลับบทบาท โต๊ะแอดมิน แอปคนขับ และสมัครฟรีแลนซ์ ลูกศรคือลิงก์ในเดโม.

```mermaid
flowchart TB
  hub["สลับบทบาท · Demo index<br/>dispatch/index.html"]

  subgraph AD["แอดมิน · Dispatch desk"]
    direction TB
    jobs["งาน · Jobs<br/>admin.html#/jobs"]
    act["แผงจัดการงาน<br/>มอบหมายคนขับประจำ · ปล่อย 30 นาที<br/>เปิดทุกคน · โบนัส · ยกเลิก · ย้ายคนขับ"]
    drv["คนขับ · Drivers<br/>admin.html#/drivers"]
    appr["แผงคนขับ<br/>อนุมัติ · ระงับ · เปิดใช้"]
    pay["จ่ายรายเดือน · Payouts<br/>#/payouts"]
    rate["เรทตัวอย่าง · Rates<br/>#/rates"]
  end

  subgraph DR["แอปคนขับ · แถบล่างสลับสี่หน้า"]
    direction TB
    login["เข้าสู่ระบบด้วย LINE<br/>LINE login · driver.html"]
    board["งานที่รับได้ · Job board<br/>#/board"]
    detail["รายละเอียดงาน · Job detail<br/>#/job/…"]
    mine["งานของฉัน · My jobs<br/>#/mine"]
    earn["รายได้ · Earnings<br/>#/earn"]
    inbox["แจ้งเตือน LINE · LINE inbox<br/>#/line"]
    stop["ถูกระงับ · Suspended<br/>รับงานใหม่ไม่ได้"]
  end

  subgraph OB["ฟรีแลนซ์ · Sign-up"]
    direction TB
    sign["สมัครและอัปโหลดเอกสาร<br/>Sign-up · signup.html"]
    wait["รออนุมัติ · Pending<br/>เข้า LINE แล้วก็ยังไม่เห็นงาน"]
  end

  hub --> jobs
  hub --> login
  hub --> sign
  jobs --> act
  jobs --> drv
  jobs --> pay
  jobs --> rate
  drv --> appr
  appr -->|อนุมัติแล้ว| board
  sign --> wait
  wait -->|เปิดแอป| login
  login -->|ใช้งานอยู่| board
  login -->|ถูกระงับ| stop
  board --> detail
  detail -->|กดรับ งานล็อก| mine
  mine --> earn
  inbox -->|แตะข้อความ| detail

  classDef entry fill:#EAF4FE,stroke:#04306D,color:#04306D,stroke-width:2px
  classDef desk fill:#E0F0FF,stroke:#0B5CA8,color:#04306D
  classDef app fill:#E6F9EC,stroke:#0A7A2F,color:#04306D
  classDef join fill:#FFF4DC,stroke:#8A5A00,color:#04306D
  classDef bad fill:#FDECEC,stroke:#C2141B,color:#04306D
  class hub entry
  class jobs,act,drv,appr,pay,rate desk
  class login,board,detail,mine,earn,inbox app
  class sign,wait join
  class stop bad
```

## วงจรจัดงาน

Job lifecycle. งานใหม่ไปจนถึงจ่ายเงิน รวมทางแยกยกเลิกและย้ายคนขับ.

```mermaid
flowchart TD
  newJob["งานใหม่จากการจอง<br/>New booking"] --> hold["ยังไม่ปล่อย · Hold"]
  hold --> choice{"แอดมินจัดอย่างไร"}
  choice -->|มอบหมายตรง| assign["มอบหมายให้คนขับประจำ<br/>รถและโซนต้องตรง<br/>Assign to regular"]
  choice -->|ปล่อยให้ทีมก่อน| release["ปล่อยรอบ 30 นาที<br/>เฉพาะคนขับประจำ<br/>Release"]
  release --> winQ{"มีคนประจำรับใน 30 นาที?"}
  winQ -->|หมดเวลา| auto["เปิดให้ฟรีแลนซ์ที่รถและโซนตรง<br/>Auto-open to freelancers"]
  auto --> urgQ{"รับภายใน 3 ชั่วโมง<br/>และยังไม่มีคน?"}
  urgQ -->|ยังไม่ด่วน| stay["คงอยู่คิวฟรีแลนซ์"]
  urgQ -->|ด่วน| openAll["เปิดทุกคน และ/หรือใส่โบนัส<br/>Open to all / bonus"]
  assign --> lock["คนแรกที่กดรับ ได้งาน และงานล็อก<br/>First Accept locks"]
  winQ -->|มีคนรับ| lock
  openAll --> lock
  lock --> go["กำลังไป · On the way"]
  go --> here["ถึงจุดรับ · At pickup"]
  here --> onboard["รับลูกค้าแล้ว · Passenger on board"]
  onboard --> doneJob["ส่งเสร็จ · Completed"]
  doneJob --> payout["จ่ายรายเดือน · Payout<br/>คนขับเห็นเฉพาะค่าตอบแทน"]

  lock --- reassign["ทางแยก: ย้ายให้คนขับประจำคนอื่น<br/>แล้วเริ่มที่ขั้นกำลังไป · Reassign"]
  go --- drvCancel["ทางแยก: คนขับยกเลิกก่อนรับลูกค้า<br/>ถึงจุดรับก็ยังยกเลิกได้ · นับครั้ง"]
  drvCancel --- pool["งานกลับเข้าคิวตามชั้นเดิม"]
  hold --- admCancel["ทางแยก: แอดมินยกเลิกทั้งงาน<br/>ทำได้ก่อนส่งเสร็จ · ไม่นับครั้งคนขับ"]
  admCancel --- cancelled["ยกเลิกแล้ว · Cancelled"]

  classDef main fill:#EAF4FE,stroke:#04306D,color:#04306D
  classDef step fill:#E6F9EC,stroke:#0A7A2F,color:#04306D
  classDef warn fill:#FFF4DC,stroke:#8A5A00,color:#04306D
  classDef bad fill:#FDECEC,stroke:#C2141B,color:#04306D
  classDef ask fill:#FFFFFF,stroke:#1668B8,color:#04306D
  class newJob,hold,assign,release,auto,openAll,lock,stay main
  class go,here,onboard,doneJob,payout step
  class reassign,pool warn
  class choice,winQ,urgQ ask
  class drvCancel,admCancel,cancelled bad
```

## สมัครฟรีแลนซ์

Freelancer onboarding. เข้า LINE อัปโหลดเอกสาร รออนุมัติ จำกัด 3 งาน และระงับเมื่อยกเลิกครบ 3 ครั้ง.

```mermaid
flowchart TD
  line["เข้าสู่ระบบด้วย LINE<br/>จำลอง ไม่ได้เชื่อม LINE จริง<br/>LINE login"]
  need{"มีบัญชีที่อนุมัติแล้วหรือยัง"}
  form["กรอกชื่อ เบอร์ โซน<br/>ประเภทรถ และทะเบียน"]
  docs["อัปโหลด 3 อย่าง<br/>ใบขับขี่ · ทะเบียนรถ · รูปรถ<br/>Upload documents"]
  pending["รออนุมัติ · Pending<br/>เข้า LINE แล้วก็ยังไม่เห็นงาน"]
  review{"แอดมินตรวจเอกสาร<br/>Drivers · รออนุมัติ"}
  ok["อนุมัติ · Approve"]
  nok["เอกสารไม่ครบ อนุมัติไม่ได้<br/>เช่น ยังไม่มีรูปรถ<br/>คงสถานะรออนุมัติ"]
  sees["เห็นงานที่รถและโซนตรง<br/>Sees matching jobs"]
  cap{"งานที่ยังไม่จบครบ 3 หรือยัง"}
  take["รับงานได้ · Accept"]
  full["รับเพิ่มไม่ได้<br/>สูงสุด 3 งาน"]
  cancels{"ยกเลิกครบ 3 ครั้งหรือยัง"}
  active["ยังรับงานต่อได้"]
  susp["ระงับอัตโนมัติ · Suspended<br/>รับงานใหม่ไม่ได้<br/>งานที่รับไว้แล้วยังทำให้จบได้"]
  back["แอดมินเปิดใช้อีกครั้ง<br/>แล้วเห็นงานได้อีก<br/>Reinstate"]

  line --> need
  need -->|ยังไม่เคยสมัคร| form --> docs --> pending
  need -->|รออนุมัติอยู่| pending
  pending --> review
  review -->|เอกสารครบ| ok --> sees
  review -->|ไม่ครบ| nok
  need -->|อนุมัติแล้ว| sees
  sees --> cap
  cap -->|ยังไม่ครบ| take --> cancels
  cap -->|ครบ 3| full
  cancels -->|ยังไม่ถึง 3| active
  cancels -->|ครบ 3| susp
  need -->|ถูกระงับอยู่แล้ว| susp
  susp --> back

  classDef join fill:#FFF4DC,stroke:#8A5A00,color:#04306D
  classDef good fill:#E6F9EC,stroke:#0A7A2F,color:#04306D
  classDef bad fill:#FDECEC,stroke:#C2141B,color:#04306D
  classDef ask fill:#FFFFFF,stroke:#1668B8,color:#04306D
  class line,form,docs,pending,nok join
  class ok,sees,take,active,back good
  class full,susp bad
  class need,review,cap,cancels ask
```

## วันทำงานของคนขับ

Driver day. จากการแจ้งเตือน LINE จนส่งลูกค้าเสร็จ.

```mermaid
flowchart TD
  ping["ได้แจ้งเตือนใน LINE จำลอง<br/>รอบทีมประจำ · งานฟรีแลนซ์ · ด่วนมีโบนัส<br/>LINE notification"]
  login["เข้าสู่ระบบด้วย LINE<br/>LINE login"]
  board["เปิดกระดานงาน · Job board<br/>เห็นเฉพาะรถและโซนของตัวเอง<br/>กรอง ทั้งหมด · รอบทีมประจำ · ด่วน · มีโบนัส"]
  open["เปิดใบงาน · Job detail<br/>วันเวลา · จุดรับ → จุดส่ง<br/>เที่ยวบิน · ผู้โดยสาร · กระเป๋า · ค่าตอบแทน"]
  who{"รับงานนี้ได้ไหม"}
  win["รอบ 30 นาที<br/>เฉพาะคนขับประจำ"]
  free["หลังหมดเวลา<br/>เฉพาะฟรีแลนซ์ที่ตรงกัน"]
  all["งานด่วน เปิดทุกคน<br/>มีโบนัสได้"]
  taken["มีคนรับไปแล้ว<br/>กลับไปดูกระดาน"]
  cap["งานค้างครบ 3<br/>ฟรีแลนซ์รับเพิ่มไม่ได้"]
  accept["กดรับงาน · Accept<br/>งานล็อกให้คนนี้คนเดียว"]
  mine["งานของฉัน · My jobs"]
  go["กำลังไป"]
  here["ถึงจุดรับ"]
  onboard["รับลูกค้าแล้ว"]
  drop["ส่งเสร็จ"]
  earn["หน้ารายได้ · Earnings<br/>เห็นเฉพาะค่าตอบแทนของตัวเอง<br/>ไม่เห็นราคาที่ลูกค้าจ่าย"]
  quit["ยกเลิกก่อนรับลูกค้า<br/>ฟรีแลนซ์ถูกนับครั้ง<br/>งานกลับเข้าคิว"]

  ping --> login --> board --> open --> who
  who -->|รอบทีมประจำ| win --> accept
  who -->|คิวฟรีแลนซ์| free --> accept
  who -->|เปิดทุกคน| all --> accept
  who -->|ถูกล็อกแล้ว| taken
  who -->|ครบ 3 งาน| cap
  accept --> mine --> go --> here --> onboard --> drop --> earn
  go --> quit
  here --> quit

  classDef line fill:#E7F8EE,stroke:#06C755,color:#04306D
  classDef app fill:#EAF4FE,stroke:#04306D,color:#04306D
  classDef step fill:#E6F9EC,stroke:#0A7A2F,color:#04306D
  classDef warn fill:#FFF4DC,stroke:#8A5A00,color:#04306D
  classDef bad fill:#FDECEC,stroke:#C2141B,color:#04306D
  classDef ask fill:#FFFFFF,stroke:#1668B8,color:#04306D
  class ping,login line
  class board,open,mine,earn app
  class go,here,onboard,drop,accept step
  class win,free,all,quit warn
  class taken,cap bad
  class who ask
```

