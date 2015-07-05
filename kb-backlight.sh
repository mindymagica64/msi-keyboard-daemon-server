#!/bin/zsh

curl -H 'Content-Type: application/json' -XPOST localhost:7070/color -d '{"region":"left", "color": "red", "intensity": "high"}'
curl -H 'Content-Type: application/json' -XPOST localhost:7070/color -d '{"region":"middle", "color": "purple", "intensity": "high"}'
curl -H 'Content-Type: application/json' -XPOST localhost:7070/color -d '{"region":"right", "color": "blue", "intensity": "high"}'