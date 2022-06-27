#!/usr/bin/env bash

set -e

namespace=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
service_name=$(hostname | cut -d'-' -f1)
watch_dirs=$(
  kubectl get deployments \
    -n "$namespace" \
    "$service_name"  \
    -o jsonpath='{.metadata.annotations.watchDirs}'
  )

echo watching "$service_name:$namespace" for changes to
echo the following dirs and their subdirs:
for dir in $watch_dirs;do
  echo "$dir"
done

# shellcheck disable=SC2086
inotifywait -m -r \
  -e modify,create,delete $watch_dirs |
  while read -r dir event file; do
    echo "$event" "$dir$file"
    echo skipping "$(timeout 1 cat | wc -l)" further changes
    kubectl exec "$(hostname)" -c "$service_name" -- \
      kill -SIGHUP 1
  done
