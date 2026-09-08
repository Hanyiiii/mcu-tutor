// Proteus 仿真向导：常见电路搭建步骤
export const GUIDES = [
  {
    id: 'g01', name: '51 最小系统', icon: '🧩', level: '基础必会',
    desc: '任何 51 仿真项目的地基：单片机 + 晶振 + 复位 + 电源。',
    parts: [
      { name: 'AT89C52', note: '单片机芯片' },
      { name: 'CRYSTAL', note: '晶振，属性设 11.0592MHz' },
      { name: 'CAP ×2', note: '30pF，晶振对地' },
      { name: 'CAP', note: '10uF，复位电容' },
      { name: 'RES', note: '10kΩ，复位下拉' },
      { name: 'RES', note: '8.2kΩ，EA 脚上拉（部分教程省略，建议接上）' }
    ],
    steps: [
      '放置 AT89C52，双击设置 Clock Frequency 为 11.0592MHz（与代码一致）',
      '晶振两端接 XTAL1(19脚)、XTAL2(18脚)，各接 30pF 电容到 GND',
      'RST(9脚) 经 10uF 电容接 VCC，同时经 10kΩ 电阻接 GND',
      'VCC(40脚) 接电源端子 POWER，GND(20脚) 接 GROUND',
      'EA(31脚) 接 VCC（接内部程序存储器），部分仿真不接也能跑，但建议接上',
      '双击 AT89C52 加载 hex，点运行验证'
    ],
    tips: ['仿真不动先查晶振频率是否与代码一致', '复位电路不可省略，否则上电状态不确定', '所有 GND 必须连到 GROUND 端子，VCC 连 POWER 端子']
  },
  {
    id: 'g02', name: 'LED 流水灯电路', icon: '💡', level: '基础必会',
    desc: '8 路 LED 依次点亮，配合模板 t01 使用。',
    parts: [
      { name: 'LED-RED ×8', note: '发光二极管' },
      { name: 'RES ×8', note: '220Ω 限流电阻' }
    ],
    steps: [
      '先搭好最小系统（见向导1）',
      '放置 8 个 LED-RED，阳极统一接 VCC',
      '每个 LED 阴极串 220Ω 电阻后接到 P1.0~P1.7',
      '加载模板 t01 编译的 hex，运行仿真观察流水效果'
    ],
    tips: ['51 单片机灌电流大，LED 用低电平点亮接法（阳极接 VCC）', '限流电阻不可少，否则 LED 电流过大', 'P0 口驱动 LED 必须加上拉排阻']
  },
  {
    id: 'g03', name: '独立按键电路', icon: '🔘', level: '基础必会',
    desc: '按键控制 LED，配合模板 t02 学习消抖。',
    parts: [
      { name: 'BUTTON', note: '轻触按键' },
      { name: 'LED-RED', note: '状态指示灯' },
      { name: 'RES', note: '220Ω LED 限流' },
      { name: 'RES', note: '10kΩ 按键上拉' }
    ],
    steps: [
      '搭好最小系统',
      'BUTTON 一端接 P3.0，另一端接 GND',
      'P3.0 与按键连接点经 10kΩ 电阻上拉到 VCC（保证松手时 IO 为高电平）',
      'LED 阳极接 VCC、阴极串 220Ω 接 P1.0',
      '加载模板 t02 的 hex，运行时点按钮观察 LED 翻转'
    ],
    tips: ['BUTTON 元件的两个引脚别接反方向，一端必须接地', '51 内部虽有弱上拉，但仿真按键建议外加 10kΩ 上拉更稳定', '按下有抖动，程序里必须有 10ms 消抖']
  },
  {
    id: 'g04', name: '数码管动态显示', icon: '🔢', level: '进阶',
    desc: '4 位共阴数码管显示数字，配合模板 t11 电子时钟。',
    parts: [
      { name: '7SEG-MPX4-CC', note: '4位共阴数码管' },
      { name: 'RESPACK-8', note: '排阻，P0 上拉' }
    ],
    steps: [
      '放置 7SEG-MPX4-CC，段选 A~G、DP 接 P0.0~P0.7（经排阻上拉到 VCC）',
      '位选引脚 1~4 接 P2.0~P2.3',
      '注意位选是低电平有效：选中位的引脚拉低',
      '加载模板 t11 的 hex，运行观察分:秒计时'
    ],
    tips: ['CC=共阴，CA=共阳，选错段码全反', 'P0 开漏必须接上拉排阻（RESPACK-8 公共端接 VCC）', '扫描每位 1~2ms，太快有重影、太慢会闪烁']
  },
  {
    id: 'g05', name: '串口通信电路', icon: '🔌', level: '进阶',
    desc: '虚拟终端显示单片机串口输出，配合模板 t05。',
    parts: [
      { name: 'VIRTUAL TERMINAL', note: '虚拟终端' }
    ],
    steps: [
      '放置 VIRTUAL TERMINAL，双击设置 Baud Rate 为 9600（与代码一致）',
      '终端 RXD 接单片机 TXD(P3.1)，TXD 接单片机 RXD(P3.0)，交叉连接',
      '加载模板 t05 的 hex，运行后终端窗口显示 Hello MCU!',
      '如需与真实上位机通信，改用 COMPIM 映射电脑串口'
    ],
    tips: ['波特率必须与代码一致，且晶振必须 11.0592MHz', '虚拟终端默认 8N1 无需改动', '乱码 = 波特率或晶振不匹配']
  },
  {
    id: 'g06', name: '蜂鸣器电路', icon: '🔔', level: '进阶',
    desc: '三极管驱动蜂鸣器，配合模板 t07 发声。',
    parts: [
      { name: 'BUZZER', note: '无源蜂鸣器（方波驱动）' },
      { name: '8550', note: 'PNP 三极管' },
      { name: 'RES', note: '1kΩ 基极限流' }
    ],
    steps: [
      'BUZZER 一端接 VCC，另一端接 8550 三极管集电极 C',
      '三极管发射极 E 接 VCC（PNP 管电流从 E 流向 C）',
      '基极 B 经 1kΩ 电阻接 P1.5',
      '加载模板 t07 的 hex，运行听蜂鸣声'
    ],
    tips: ['有源蜂鸣器用 SOUNDER（给电平即响），无源用 BUZZER（需方波）', 'IO 直接驱动蜂鸣器电流不足，务必用三极管', '若声音不对，检查三极管是 PNP 还是 NPN 及接法']
  },
  {
    id: 'g07', name: 'LCD1602 显示电路', icon: '📟', level: '进阶',
    desc: '字符液晶两行显示，配合模板 t09。',
    parts: [
      { name: 'LM016L', note: 'LCD1602 液晶' }
    ],
    steps: [
      '放置 LM016L，数据口 D0~D7 接 P0.0~P0.7（P0 需上拉排阻）',
      'RS 接 P2.0、RW 接 P2.1、E 接 P2.2',
      'VSS 接 GND、VDD 接 VCC、VEE 接电位器抽头（仿真可悬空或接 GND）',
      '加载模板 t09 的 hex，运行显示 ChipMaster AI'
    ],
    tips: ['LM016L 是 1602 的 Proteus 库名，别搜 LCD1602 搜不到', '只有第一行亮黑色方块 = 初始化失败，检查时序延时', '需要显示中文换 12864（LGM12641BS1R）']
  },
  {
    id: 'g08', name: 'DS18B20 温度采集', icon: '🌡️', level: '挑战',
    desc: '单总线温度传感器电路，重点在 1-Wire 时序。',
    parts: [
      { name: 'DS18B20', note: '单总线温度传感器' },
      { name: 'RES', note: '4.7kΩ 上拉' }
    ],
    steps: [
      '放置 DS18B20，数据脚 DQ 接 P3.3 并经 4.7kΩ 上拉到 VCC',
      'VDD 接 VCC、GND 接 GND（外部供电模式）',
      '编写/加载 1-Wire 驱动代码：复位 → 0xCC 跳过ROM → 0x44 启动转换 → 750ms → 0xBE 读温度',
      '温度换算：读到的 16 位值 × 0.0625 = 摄氏度'
    ],
    tips: ['DQ 脚必须 4.7kΩ 上拉，否则通信失败', '读写时序是 us 级，中断要关掉防打断', '先抄成熟驱动跑通，再自己改，时序题别硬背']
  }
]

export function findGuide(id) {
  return GUIDES.find((g) => g.id === id)
}
