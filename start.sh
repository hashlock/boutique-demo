#!/bin/bash
GREEN='\033[92m'
BLUE='\033[96m'
YELLOW='\033[93m'
GREY='\033[37m'
CLEAR='\033[90m'

credFile="thousandeyes/kubernetes/te-credentials.yaml"

printf "${GREEN}Boutique Demo${CLEAR}"
printf "\n"

if [[ -f "./$credFile" ]]; then
  echo "Credentials already set. (To reset, delete $credFile and run start.sh again)"
else
  printf "${BLUE}Enter your ThousandEyes Account Group Token: ${YELLOW}"
  read TEAGENT_ACCOUNT_TOKEN
  TEAGENT_ACCOUNT_TOKEN_BASE64=$(echo $TEAGENT_ACCOUNT_TOKEN | base64)
  printf "${CLEAR}"
  echo "apiVersion: v1
kind: Secret 
metadata: 
  name: te-credentials 
type: Opaque 
data: 
  TEAGENT_ACCOUNT_TOKEN: ${TEAGENT_ACCOUNT_TOKEN_BASE64}" > ./$credFile
  echo "Created ThousandEyes token in $credFile"
fi

gcpproject=$(gcloud config get-value project)
printf "Using GCP project: ${YELLOW}$gcpproject${CLEAR}\n"
echo "skaffold run --default-repo=gcr.io/$gcpproject"
skaffold run --default-repo=gcr.io/$gcpproject