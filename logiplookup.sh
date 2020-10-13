#!/bin/bash
numips=$2
if [[ "$numips" == "" ]]; then numips=300; fi
kubectl logs $1 | grep -v -e "_healthz" | jq -r '."http.source"' | cut -d: -f1 | sort | uniq | tail -n $numips > ips.txt
exec 3<"ips.txt"
while IFS='' read -r -u 3 ip || [[ -n "$ip" ]]; do
    WHOIS=`whois $ip | grep -E 'Organization' | tr -s " " | cut -d: -f2`
    echo "$ip: $WHOIS"
done
