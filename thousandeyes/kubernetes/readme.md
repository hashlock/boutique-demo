# Deploy ThousandEyes Docker Agent on Kubernetes

In this example the ThousandEyes Docker Agent must be deployed to a fixed Kubernetes node to ensure that the agent's identity persists across Pod re-deployments. This requires labeling the Kubernetes node that ThousandEyes agent will deploy to. 

### Label Kubernetes node
```
kubectl get nodes
kubectl label nodes <node name> tehost=host2
```
### Deploy ThousandEyes Agent


```
kubectl apply -f te-agent-boutique.yaml
```

Name of agent (AGENT_NAME) will be hard coded to `te-agent-boutique`. Agent configuration and logs will be mounted as a Persistent Volume at `\var\thousandeyes\%AGENT_NAME%` on the target Kubernetes Node. 
