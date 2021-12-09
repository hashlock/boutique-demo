# Deploy ThousandEyes Docker Agent on Kubernetes

In this example the ThousandEyes Docker Agent must be deployed to a fixed Kubernetes node to ensure that the agent's identity persists across Pod re-deployments. This requires labeling the Kubernetes node that ThousandEyes agent will deploy to. 

### Label Kubernetes node
```
kubectl get nodes
kubectl label nodes <node name> tehost=host2
```

### Set ThousandEyes Account Token
You're ThousandEyes Account Token tells the agent what account it will belong to. The token can be found in ThousandEyes UI when you select Agents->Add New Enterprise Agent. Click on Account Token "Copy" button. Next you'll need to convert to Base64:

```
echo <your token> | base64
ex:. bno0ZzhlYmpuOHhzaHg1YXl3rdrdf4553VscDAybHkK
```

Paste this Base64 token into `te-credentials.yaml`:
```
    TE_ACCOUNT_TOKEN: bno0ZzhlYmpuOHhzaHg1YXl3rdrdf4553VscDAybHkK
```

Then apply the credentials to Kubernetes:

```
kubectl apply -f te-credentials.yaml
```

### Deploy ThousandEyes Agent


```
kubectl apply -f te-agent-statefulset.yaml
```

Name of agent (AGENT_NAME) will be set to `te-agent-boutique-0`. Agent configuration and logs will be mounted as a Persistent Volume at `\var\thousandeyes\%AGENT_NAME%` on the target Kubernetes Node.
