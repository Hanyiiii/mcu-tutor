# 后处理：页脚 PAGE 域加格式开关（WPS 兼容）+ 移除封面空 pgNumType
import zipfile, shutil, re, sys

SRC = "芯师傅ChipMaster参赛报告.docx"
TMP = "芯师傅ChipMaster参赛报告.tmp.docx"

with zipfile.ZipFile(SRC, "r") as zin:
    names = zin.namelist()
    footer_files = sorted([n for n in names if re.match(r"word/footer\d+\.xml", n)])
    with zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
        for n in names:
            data = zin.read(n)
            if n == "word/document.xml":
                # 移除所有空 <w:pgNumType/>（docx-js 在未设置页码的节也会输出空标签，WPS 会混淆）
                data = data.replace(b"<w:pgNumType/>", b"")
            if n in footer_files:
                text = data.decode("utf-8")
                idx = footer_files.index(n)
                if idx == 0:
                    # 第一个页脚 = 目录节 → 罗马数字
                    text = re.sub(
                        r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
                        r"\1 PAGE \\* ROMAN \\* MERGEFORMAT \2", text)
                else:
                    # 其余页脚（正文节）→ 阿拉伯数字
                    text = re.sub(
                        r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
                        r"\1 PAGE \\* arabic \\* MERGEFORMAT \2", text)
                data = text.encode("utf-8")
            zout.writestr(n, data)

shutil.move(TMP, SRC)
print("页脚补丁完成，页脚文件：", footer_files)
