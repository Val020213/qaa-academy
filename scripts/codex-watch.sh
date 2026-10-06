#!/bin/bash
# Watch a Codex verification run.
#
#   scripts/codex-watch.sh shop          # follow the shop-side run live
#   scripts/codex-watch.sh site          # follow the site-side run live
#   scripts/codex-watch.sh shop status   # one-screen summary, then exit
#
# It reads the event log that the run writes (.scratch/codex-<name>/codex.jsonl)
# and prints the agent's own notes in full and each command as one short line.

NAME="${1:-shop}"
MODE="${2:-follow}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/.scratch/codex-$NAME"
LOG="$DIR/codex.jsonl"

if [ ! -f "$LOG" ]; then
  echo "No run found at $DIR"
  exit 1
fi

FILTER='
  if .type == "item.completed" and .item.type == "agent_message" then
    "\n\u001b[1mNOTE\u001b[0m  " + (.item.text | gsub("\n+$"; ""))
  elif .type == "item.started" and .item.type == "command_execution" then
    "  run   " + (.item.command | gsub("\\s+"; " ") | .[0:140])
  elif .type == "item.completed" and .item.type == "command_execution" and (.item.exit_code // 0) != 0 then
    "  \u001b[31mexit " + (.item.exit_code | tostring) + "\u001b[0m"
  elif .type == "error" or (.item.type? == "error") then
    "  \u001b[31mERROR\u001b[0m " + ((.message // .item.message // "") | tostring | .[0:200])
  else empty end'

if [ "$MODE" = "status" ]; then
  if [ -f "$DIR/DONE" ]; then
    echo "State:    finished (exit code $(cat "$DIR/DONE"))"
  else
    echo "State:    running"
  fi
  echo "Last log: $(date -r "$LOG" '+%H:%M:%S')   now: $(date '+%H:%M:%S')"
  echo "Commands: $(grep -c '"item.started","item":{"id":"[^"]*","type":"command_execution"' "$LOG")"
  echo "Report:   $([ -f "$DIR/REPORT.md" ] && echo "$DIR/REPORT.md" || echo "not written yet")"
  echo
  echo "Last three notes from the agent:"
  jq -r 'select(.type == "item.completed" and .item.type == "agent_message") | .item.text' "$LOG" 2>/dev/null |
    awk 'BEGIN{RS=""} {a[NR]=$0} END{for(i=(NR>3?NR-2:1);i<=NR;i++) print "- " a[i] "\n"}'
  exit 0
fi

# Follow: show the last 40 events, then keep printing new ones.
tail -n 40 -f "$LOG" | jq -r --unbuffered "$FILTER" 2>/dev/null
