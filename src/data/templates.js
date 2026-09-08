// Keil C51 / STM32 代码模板库
export const TEMPLATES = [
  {
    id: 't01', name: 'LED 流水灯', chip: '8051', level: '入门',
    tags: ['LED', '流水灯', '点灯'],
    desc: 'P1 口 8 路 LED 依次点亮，循环左移产生流水效果。单片机入门第一个程序。',
    parts: ['AT89C52', 'LED-RED ×8', 'RES 220Ω ×8'],
    code: String.raw`#include <reg52.h>
#include <intrins.h>

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

void main(void) {
    unsigned char led = 0xFE;    /* 低电平点亮，最低位灯先亮 */
    while (1) {
        P1 = led;
        delay_ms(200);
        led = _crol_(led, 1);    /* 循环左移一位 */
    }
}`
  },
  {
    id: 't02', name: '独立按键控制 LED', chip: '8051', level: '入门',
    tags: ['按键', '消抖', 'LED'],
    desc: '按一下按键，LED 状态翻转。包含完整的软件消抖处理。',
    parts: ['AT89C52', 'BUTTON', 'LED-RED', 'RES 220Ω', 'RES 10kΩ'],
    code: String.raw`#include <reg52.h>

sbit KEY = P3^0;   /* 按键接 P3.0，按下接地 */
sbit LED = P1^0;   /* LED 接 P1.0，低电平点亮 */

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

void main(void) {
    while (1) {
        if (KEY == 0) {            /* 检测按下（低电平） */
            delay_ms(10);          /* 软件消抖 10ms */
            if (KEY == 0) {        /* 确认仍按下 */
                LED = ~LED;        /* LED 状态翻转 */
                while (KEY == 0);  /* 等待松手 */
            }
        }
    }
}`
  },
  {
    id: 't03', name: '数码管 0~9 循环显示', chip: '8051', level: '入门',
    tags: ['数码管', '显示', '段码'],
    desc: '单只共阴数码管循环显示 0~9，P0 送段码，理解段码表原理。',
    parts: ['AT89C52', '7SEG-COM-CATHODE', 'RESPACK-8 排阻'],
    code: String.raw`#include <reg52.h>

/* 共阴数码管段码 0~9 */
unsigned char code SEG_CODE[] = {
    0x3F, 0x06, 0x5B, 0x4F, 0x66,
    0x6D, 0x7D, 0x07, 0x7F, 0x6F
};

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

void main(void) {
    unsigned char i = 0;
    while (1) {
        P0 = SEG_CODE[i];   /* 送段码，P0 需上拉 */
        delay_ms(500);
        i = (i + 1) % 10;   /* 0~9 循环 */
    }
}`
  },
  {
    id: 't04', name: '定时器 1 秒 LED 翻转', chip: '8051', level: '进阶',
    tags: ['定时器', '中断', 'T0', '计时'],
    desc: '定时器 T0 方式 1，50ms 中断 × 20 次 = 精确 1s，LED 每秒翻转。',
    parts: ['AT89C52', 'LED-RED', 'RES 220Ω'],
    code: String.raw`#include <reg52.h>

sbit LED = P1^0;
unsigned char count = 0;    /* 50ms 计数值 */

void Timer0_Init(void) {
    TMOD &= 0xF0;           /* 保留高4位，T0 设为方式1 */
    TMOD |= 0x01;
    TH0 = (65536 - 46080) / 256;   /* 50ms @11.0592MHz */
    TL0 = (65536 - 46080) % 256;
    ET0 = 1;                /* 允许 T0 中断 */
    EA  = 1;                /* 开总中断 */
    TR0 = 1;                /* 启动 T0 */
}

void Timer0_ISR(void) interrupt 1 {
    TH0 = (65536 - 46080) / 256;   /* 重装初值 */
    TL0 = (65536 - 46080) % 256;
    count++;
    if (count == 20) {      /* 20 x 50ms = 1s */
        count = 0;
        LED = ~LED;
    }
}

void main(void) {
    Timer0_Init();
    while (1);
}`
  },
  {
    id: 't05', name: '串口发送字符串', chip: '8051', level: '进阶',
    tags: ['串口', 'UART', '波特率', '通信'],
    desc: 'UART 方式 1，9600 波特率循环发送字符串，Proteus 虚拟终端可查看。',
    parts: ['AT89C52', 'VIRTUAL TERMINAL'],
    code: String.raw`#include <reg52.h>

void UART_Init(void) {
    SCON = 0x50;            /* 方式1，8位UART，允许接收 */
    TMOD &= 0x0F;
    TMOD |= 0x20;           /* T1 方式2，8位自动重装 */
    TH1 = 0xFD;             /* 9600 波特率 @11.0592MHz */
    TL1 = 0xFD;
    TR1 = 1;                /* 启动 T1 */
}

void UART_SendChar(unsigned char ch) {
    SBUF = ch;
    while (TI == 0);        /* 等待发送完成 */
    TI = 0;
}

void UART_SendStr(char *str) {
    while (*str != '\0') {
        UART_SendChar(*str++);
    }
}

void main(void) {
    UART_Init();
    while (1) {
        UART_SendStr("Hello MCU!\r\n");
        /* 延时约1秒 */
        unsigned int i, j;
        for (i = 0; i < 1000; i++)
            for (j = 0; j < 120; j++);
    }
}`
  },
  {
    id: 't06', name: '外部中断按键计数', chip: '8051', level: '进阶',
    tags: ['外部中断', 'INT0', '计数', '中断'],
    desc: '外部中断 0（P3.2 下降沿）计数，每按 10 次 LED 翻转一次。',
    parts: ['AT89C52', 'BUTTON', 'LED-RED', 'RES 220Ω', 'RES 10kΩ'],
    code: String.raw`#include <reg52.h>

sbit LED = P1^0;
unsigned int cnt = 0;

void EX0_ISR(void) interrupt 0 {   /* 外部中断0，P3.2 下降沿触发 */
    cnt++;
    if (cnt >= 10) {               /* 每按 10 次翻转 LED */
        cnt = 0;
        LED = ~LED;
    }
}

void main(void) {
    IT0 = 1;    /* 下降沿触发 */
    EX0 = 1;    /* 允许外部中断 0 */
    EA  = 1;    /* 开总中断 */
    while (1);
}`
  },
  {
    id: 't07', name: '无源蜂鸣器发声', chip: '8051', level: '进阶',
    tags: ['蜂鸣器', '无源', '发声', '方波'],
    desc: 'IO 翻转产生 1kHz 方波驱动无源蜂鸣器，间歇发声。',
    parts: ['AT89C52', 'BUZZER', '三极管 8550', 'RES 1kΩ'],
    code: String.raw`#include <reg52.h>

sbit BEEP = P1^5;

void delay_us(unsigned int us) {
    while (us--);
}

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

/* 发声 freq_hz 频率，持续 ms 毫秒 */
void beep(unsigned int freq_hz, unsigned int ms) {
    unsigned int i;
    unsigned int half = (unsigned int)(500000UL / freq_hz);  /* 半周期(us) */
    unsigned int n    = (unsigned int)((unsigned long)freq_hz * ms / 1000);
    for (i = 0; i < n; i++) {
        BEEP = ~BEEP;
        delay_us(half);
    }
}

void main(void) {
    while (1) {
        beep(1000, 200);   /* 1kHz 响 200ms */
        delay_ms(500);
    }
}`
  },
  {
    id: 't08', name: '4×4 矩阵键盘扫描', chip: '8051', level: '进阶',
    tags: ['矩阵键盘', '扫描', '按键'],
    desc: 'P1 口行列扫描读取 16 个按键，键值输出到 P0（可接数码管/LED）。',
    parts: ['AT89C52', 'KEYPAD-SMALLCALC', 'RESPACK-8'],
    code: String.raw`#include <reg52.h>

#define KEYPAD P1

unsigned char code KEY_MAP[4][4] = {
    {'1', '2', '3', 'A'},
    {'4', '5', '6', 'B'},
    {'7', '8', '9', 'C'},
    {'*', '0', '#', 'D'}
};

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

/* 返回键值，无按键返回 0 */
unsigned char KeyScan(void) {
    unsigned char row, col;
    for (row = 0; row < 4; row++) {
        KEYPAD = ~(0x01 << row);      /* 该行输出低电平 */
        col = KEYPAD & 0xF0;
        if (col != 0xF0) {            /* 该行有键按下 */
            delay_ms(10);             /* 消抖 */
            col = KEYPAD & 0xF0;
            if (col != 0xF0) {
                while ((KEYPAD & 0xF0) != 0xF0);  /* 等松手 */
                if (col == 0xE0) return KEY_MAP[row][0];
                if (col == 0xD0) return KEY_MAP[row][1];
                if (col == 0xB0) return KEY_MAP[row][2];
                if (col == 0x70) return KEY_MAP[row][3];
            }
        }
    }
    return 0;
}

void main(void) {
    while (1) {
        unsigned char k = KeyScan();
        if (k != 0) {
            P0 = k;   /* 键值输出到 P0 观察 */
        }
    }
}`
  },
  {
    id: 't09', name: 'LCD1602 显示字符串', chip: '8051', level: '进阶',
    tags: ['LCD1602', '液晶', '显示'],
    desc: 'LCD1602 两行显示字符，P0 数据口 + P2 控制口。',
    parts: ['AT89C52', 'LM016L'],
    code: String.raw`#include <reg52.h>

#define LCD_DATA P0
sbit LCD_RS = P2^0;
sbit LCD_RW = P2^1;
sbit LCD_EN = P2^2;

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

void LCD_WriteCmd(unsigned char cmd) {
    LCD_RS = 0; LCD_RW = 0;
    LCD_DATA = cmd;
    LCD_EN = 1; delay_ms(1);
    LCD_EN = 0; delay_ms(1);
}

void LCD_WriteData(unsigned char dat) {
    LCD_RS = 1; LCD_RW = 0;
    LCD_DATA = dat;
    LCD_EN = 1; delay_ms(1);
    LCD_EN = 0; delay_ms(1);
}

void LCD_Init(void) {
    delay_ms(20);
    LCD_WriteCmd(0x38);   /* 8位数据，2行，5x7 */
    LCD_WriteCmd(0x0C);   /* 开显示，无光标 */
    LCD_WriteCmd(0x06);   /* 光标右移 */
    LCD_WriteCmd(0x01);   /* 清屏 */
}

void LCD_ShowStr(unsigned char x, unsigned char y, char *str) {
    unsigned char addr = (y == 0) ? (0x80 + x) : (0xC0 + x);
    LCD_WriteCmd(addr);
    while (*str != '\0') {
        LCD_WriteData(*str++);
    }
}

void main(void) {
    LCD_Init();
    LCD_ShowStr(0, 0, "ChipMaster AI");
    LCD_ShowStr(0, 1, "MCU Tutor v1.0");
    while (1);
}`
  },
  {
    id: 't10', name: 'PWM 呼吸灯', chip: '8051', level: '挑战',
    tags: ['PWM', '呼吸灯', '占空比', '定时器'],
    desc: '定时器 100us 中断软件模拟 PWM，占空比渐变动实现呼吸灯。',
    parts: ['AT89C52', 'LED-RED', 'RES 220Ω'],
    code: String.raw`#include <reg52.h>

sbit LED = P1^0;
unsigned char pwm = 0;   /* 亮度 0~100 */
bit dir = 0;             /* 0=变亮 1=变暗 */

void Timer0_ISR(void) interrupt 1 {
    static unsigned char cnt = 0;
    TH0 = (65536 - 1000) / 256;    /* 约100us中断 */
    TL0 = (65536 - 1000) % 256;
    cnt++;
    if (cnt >= 100) cnt = 0;
    LED = (cnt < pwm) ? 0 : 1;     /* 低电平点亮 */
}

void main(void) {
    unsigned int i;
    TMOD &= 0xF0;
    TMOD |= 0x01;
    TH0 = (65536 - 1000) / 256;
    TL0 = (65536 - 1000) % 256;
    ET0 = 1; EA = 1; TR0 = 1;
    while (1) {
        for (i = 0; i < 30000; i++);   /* 呼吸节奏 */
        if (dir == 0) {
            pwm += 5;
            if (pwm >= 100) dir = 1;
        } else {
            pwm -= 5;
            if (pwm == 0) dir = 0;
        }
    }
}`
  },
  {
    id: 't11', name: '数码管电子时钟（分:秒）', chip: '8051', level: '挑战',
    tags: ['电子时钟', '数码管', '综合', '定时器'],
    desc: '4 位共阴数码管动态扫描 + 定时器精确计时，显示分:秒。',
    parts: ['AT89C52', '7SEG-MPX4-CC', 'RESPACK-8'],
    code: String.raw`#include <reg52.h>

unsigned char code SEG[] = {
    0x3F, 0x06, 0x5B, 0x4F, 0x66,
    0x6D, 0x7D, 0x07, 0x7F, 0x6F
};

unsigned char sec = 0, min = 0;
unsigned char disp[4];     /* 显示缓冲 MM:SS */

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

/* 动态扫描显示 4 位 */
void Display(void) {
    unsigned char i, sel = 0xFE;
    for (i = 0; i < 4; i++) {
        P0 = 0xFF;              /* 消隐 */
        P0 = SEG[disp[i]];
        if (i == 1) P0 |= 0x80; /* 第2位加小数点作分隔 */
        P2 = sel;               /* 位选低电平有效 */
        delay_ms(2);
        P2 = 0xFF;
        sel = (sel << 1) | 0x01;
    }
}

void Timer0_ISR(void) interrupt 1 {
    static unsigned char cnt = 0;
    TH0 = (65536 - 46080) / 256;   /* 50ms */
    TL0 = (65536 - 46080) % 256;
    if (++cnt >= 20) {             /* 1s */
        cnt = 0;
        sec++;
        if (sec >= 60) { sec = 0; min++; }
        if (min >= 60) min = 0;
    }
}

void main(void) {
    TMOD &= 0xF0;
    TMOD |= 0x01;
    TH0 = (65536 - 46080) / 256;
    TL0 = (65536 - 46080) % 256;
    ET0 = 1; EA = 1; TR0 = 1;
    while (1) {
        disp[0] = min / 10;
        disp[1] = min % 10;
        disp[2] = sec / 10;
        disp[3] = sec % 10;
        Display();
    }
}`
  },
  {
    id: 't12', name: '74HC595 扩展 8 路 LED', chip: '8051', level: '挑战',
    tags: ['74HC595', '移位寄存器', '扩展'],
    desc: '3 根 IO 口驱动 8 路 LED，理解串转并移位寄存器。',
    parts: ['AT89C52', '74HC595', 'LED-RED ×8', 'RES 220Ω ×8'],
    code: String.raw`#include <reg52.h>

sbit SRCLK = P2^0;   /* 移位时钟 */
sbit RCLK  = P2^1;   /* 锁存时钟 */
sbit SER   = P2^2;   /* 串行数据 */

void delay_ms(unsigned int ms) {
    unsigned int i, j;
    for (i = 0; i < ms; i++)
        for (j = 0; j < 120; j++);
}

void HC595_Send(unsigned char dat) {
    unsigned char i;
    for (i = 0; i < 8; i++) {
        SER = (dat & 0x80) ? 1 : 0;  /* 先发高位 */
        SRCLK = 1;
        SRCLK = 0;                   /* 上升沿移位 */
        dat <<= 1;
    }
    RCLK = 1;
    RCLK = 0;                        /* 锁存输出 */
}

void main(void) {
    unsigned char led = 0xFE;
    while (1) {
        HC595_Send(led);             /* 低电平点亮 */
        delay_ms(200);
        led = (led << 1) | 0x01;
        if (led == 0xFF) led = 0xFE;
    }
}`
  },
  {
    id: 't13', name: 'STM32 HAL 库点灯', chip: 'STM32', level: '入门',
    tags: ['STM32', 'HAL', 'GPIO', '点灯'],
    desc: 'STM32F103 HAL 库版流水灯（PC13），CubeMX 工程骨架。',
    parts: ['STM32F103C8T6 开发板'],
    code: String.raw`#include "stm32f1xx_hal.h"

void SystemClock_Config(void);   /* CubeMX 自动生成 */

int main(void) {
    GPIO_InitTypeDef gpio = {0};

    HAL_Init();
    SystemClock_Config();

    __HAL_RCC_GPIOC_CLK_ENABLE();   /* 使能 PC 时钟 */

    gpio.Pin   = GPIO_PIN_13;       /* 板载 LED PC13 */
    gpio.Mode  = GPIO_MODE_OUTPUT_PP;
    gpio.Pull  = GPIO_NOPULL;
    gpio.Speed = GPIO_SPEED_FREQ_LOW;
    HAL_GPIO_Init(GPIOC, &gpio);

    while (1) {
        HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
        HAL_Delay(500);             /* 500ms */
    }
}`
  }
]

export function findTemplate(id) {
  return TEMPLATES.find((t) => t.id === id)
}
