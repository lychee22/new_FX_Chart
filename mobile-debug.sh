#!/usr/bin/env bash
# ============================================================
# FORFX Chart 手机本地调试辅助脚本
#
# 用法:   bash mobile-debug.sh
# 功能:
#   1. 解析电脑局域网 IPv4（优先无线网卡）
#   2. 探测后端(23723) / 前端(23722) 是否已启动
#   3. 尝试放行 Windows 防火墙入站 TCP 23722（需管理员权限）
#
# 适用: Windows Git Bash（Linux/WSL 也有基本兜底）
# 详细步骤见仓库根目录《手机本地调试指南.md》
# ============================================================

set -u

PORT_FRONT=23722
PORT_BACK=23723
RULE_NAME="FORFXChart-Dev-23722"

echo "============================================================"
echo " FORFX Chart 手机本地调试辅助脚本"
echo "============================================================"

# ---------- 1. 局域网 IPv4 ----------
# 说明: Windows 中文输出的中文部分是 GBK 编码，脚本按 UTF-8 匹配不到，
#       因此只依赖 ASCII 标记（adapter / WLAN / Wi-Fi）识别无线网卡。
get_all_lan_ips() {
  # 输出格式: "WLAN|OTHER<TAB>IP"（仅保留私有网段）
  if command -v ipconfig >/dev/null 2>&1; then
    ipconfig | awk '
      /adapter|WLAN|Wi-?Fi/ { adapter = $0 }
      /IPv4/ {
        ip = $NF
        if (ip ~ /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/) {
          if (adapter ~ /WLAN|Wi-?Fi/) print "WLAN\t" ip
          else                        print "OTHER\t" ip
        }
      }
    '
  fi
}

find_lan_ip() {
  local rows wireless other
  rows=$(get_all_lan_ips)
  # 优先无线网卡（WLAN / Wi-Fi），其次其他网卡
  wireless=$(echo "$rows" | grep '^WLAN' | head -1 | cut -f2)
  if [ -n "$wireless" ]; then
    echo "$wireless"
    return 0
  fi
  other=$(echo "$rows" | grep '^OTHER' | head -1 | cut -f2)
  if [ -n "$other" ]; then
    echo "$other"
    return 0
  fi
  echo ""
}

LAN_IP=$(find_lan_ip)

# ---------- 2. 端口探测 ----------
check_port() {
  local port=$1
  # 方式一: bash /dev/tcp（Git Bash 支持）
  if (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then
    exec 3>&- 2>/dev/null
    exec 3<&- 2>/dev/null
    return 0
  fi
  # 方式二: netstat 兜底（固定字符串匹配 ":$port "，避免正则在该环境的兼容问题）
  if command -v netstat >/dev/null 2>&1; then
    netstat -ano 2>/dev/null | grep -qF ":$port " && return 0
  fi
  return 1
}

# ---------- 3. 防火墙 ----------
apply_firewall() {
  if ! command -v netsh >/dev/null 2>&1; then
    echo "  [跳过] 未检测到 netsh（非 Windows），请自行放行入站 TCP $PORT_FRONT"
    return 0
  fi
  if netsh advfirewall firewall show rule name="$RULE_NAME" >/dev/null 2>&1; then
    echo "  [OK]   防火墙规则已存在: $RULE_NAME"
    return 0
  fi
  echo "  尝试添加防火墙入站规则（需要管理员权限）..."
  local out
  out=$(netsh advfirewall firewall add rule name="$RULE_NAME" dir=in action=allow protocol=TCP localport=$PORT_FRONT 2>&1)
  if [ $? -eq 0 ]; then
    echo "  [OK]   已放行入站 TCP $PORT_FRONT"
  else
    echo "  [失败] 添加规则未成功（通常是无管理员权限）:"
    echo "         $out"
    echo "  请手动以管理员身份运行:"
    echo "     netsh advfirewall firewall add rule name=\"$RULE_NAME\" dir=in action=allow protocol=TCP localport=$PORT_FRONT"
  fi
}

# ============================================================
echo ""
echo ">> 1. 电脑局域网 IP"
if [ -n "$LAN_IP" ]; then
  echo "  [OK]   局域网 IPv4: $LAN_IP"
  echo "  手机访问地址: http://$LAN_IP:$PORT_FRONT"
else
  echo "  [失败] 未能自动解析局域网 IP，请手动执行 ipconfig 查看"
  echo "         （脚本仅保留 10.x / 192.168.x / 172.16-31.x 私有网段）"
fi

echo ""
echo ">> 2. 端口探测"
if check_port "$PORT_BACK"; then
  echo "  [OK]   后端已启动:   127.0.0.1:$PORT_BACK"
else
  echo "  [警告] 后端未启动:   127.0.0.1:$PORT_BACK"
  echo "         请先运行: cd backend && mvn spring-boot:run（或 java -jar chart-backend-1.0.0.jar）"
fi
if check_port "$PORT_FRONT"; then
  echo "  [OK]   前端已启动:   0.0.0.0:$PORT_FRONT"
else
  echo "  [警告] 前端未启动:   0.0.0.0:$PORT_FRONT"
  echo "         请先运行: cd frontend && npm run dev"
fi

echo ""
echo ">> 3. Windows 防火墙"
apply_firewall

echo ""
echo "============================================================"
echo " 访问方式汇总"
if [ -n "$LAN_IP" ]; then
  echo "  同一 WiFi  : 手机浏览器打开  http://$LAN_IP:$PORT_FRONT"
  echo "  Android USB: adb reverse tcp:$PORT_FRONT tcp:$PORT_FRONT"
  echo "               （然后手机 Chrome 打开 http://localhost:$PORT_FRONT）"
fi
echo "  详细步骤与常见问题见《手机本地调试指南.md》"
echo "============================================================"
