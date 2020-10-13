# Boutique Demo

This demo uses the Google GCP Boutique eCommerse Kubernetes application and ThousandEyes monitoring to illustrate the importance of edge, cloud and Internet monitoring of cloud native applications.

## Setup
The demo application uses GCP Kubernetes Engine and is deployed with [Skaffold](https://skaffold.dev/docs/install/) (a CI/CD tool for Kubernetes apps). You'll also need Google CLI (`gcloud`) and Docker (in order to build the application). Follow the setup instructions under [microservices-demo](./microservices-demo/README.md) for more setup details.

You'll also need a ThousandEyes account (you can get a [14-day trial](https://www.thousandeyes.com/signup) if needed) and the ThousandEyes [Account Group token](https://docs.thousandeyes.com/product-documentation/enterprise-agents/where-can-i-get-the-account-group-token) of the account you want to use for the demo.

## Deploying and Running
Once setup, you can run `./start.sh` to deploy and run the demo app. This script will ask you to enter your ThousandEyes Account Group token, which will be used to create a credentials file used in the deployment. 

``` bash
./start.sh

Boutique Demo
Enter your ThousandEyes Account Group Token: nz4g..2ly
Created ThousandEyes token in thousandeyes/kubernetes/te-credentials.yaml
Using GCP project: pmm-se-demo
skaffold run --default-repo=gcr.io/pmm-se-demo
Generating tags...
 - emailservice -> gcr.io/pmm-se-demo/emailservice:6acd77d-dirty
 - productcatalogservice -> gcr.io/pmm-se-demo/productcatalogservice:6acd77d
 ...
 - adservice -> gcr.io/pmm-se-demo/adservice:6acd77d
Checking cache...
 - emailservice: Found Remotely
 - paymentservice: Not found. Building
 - currencyservice: Not found. Building
 ...
 - adservice: Found Remotely
Building [paymentservice]...
Sending build context to Docker daemon  154.1kB
...
Starting deploy...
 - deployment.apps/paymentservice configured
 - service/paymentservice configured
 - deployment.apps/emailservice configured
 - service/emailservice configured
 - deployment.apps/productcatalogservice configured
...
 - secret/boutique-credentials configured
 - service/te-agent-boutique configured
 - statefulset.apps/te-agent-boutique configured
 - persistentvolume/te-agent-boutique-vol configured
 - persistentvolumeclaim/te-agent-boutique-claim configured

Deployments stabilized in 25.861456554s
You can also run [skaffold run --tail] to get the logs
```
**Note** - on the first run, building all the demo app services may take up to 20 minutes.

Runing `kubectl get pods` should show all the demo app services running as well as the ThousandEyes Agent (`te-agent-boutique-0`).

```bash
> kubectl get pods
NAME                                     READY   STATUS    RESTARTS   AGE
adservice-7986949f8c-ddb8t               1/1     Running   0          7h56m
cartservice-54f998496d-94zgr             1/1     Running   0          7h56m
checkoutservice-756764f598-slqfr         1/1     Running   0          7h56m
currencyservice-d856f8d88-2kt82          1/1     Running   0          7h56m
emailservice-6fb6cfc54d-495c5            1/1     Running   0          7h56m
frontend-67d5769975-w6llh                1/1     Running   0          7h45m
paymentservice-7f58dd768-7hcq5           1/1     Running   0          7h56m
productcatalogservice-5d74945987-xc8qd   1/1     Running   0          7h56m
recommendationservice-75dddfc755-hkrjt   1/1     Running   0          7h56m
redis-cart-55dcfd57c6-hqp4x              1/1     Running   0          19d
shippingservice-855b54dd6f-z6bgk         1/1     Running   0          7h56m
te-agent-boutique-0                      1/1     Running   0          7h56m
```

### ThousandEyes Kubernetes Agent
This demo includes a ThousandEyes agent that is deployed as a StatefulSet. It also uses a persistant volume to preserve agent status across cluster re-deployments. It uses the credentials file to determine what ThousandEyes Account Group it will be deployed to. See:

- `thousandeyes/kubernetes/te-agent-statefulset.yaml`
- `thousandeyes/kubernetes/te-credentials.yaml`

The ThousandEyes Agent will deploy along with the demo app when running `./start.sh` or `skaffold run`. The agent can also be manually deployed using kubectl:

`kubectl apply -f thousandeyes/kubernetes/te-agent-boutique.yaml`

Once deployed, you should see the ThousandEyes Agent come online in ThousandEyes:

![ThousandEyes Agent](docs/agent.png?raw=true "ThousandEyes Agent")

### Edge Configuration (CDN)
This demo can leverage CDNs to illustrate the importance of understanding how "the Edge" can impact the performance your end users experience of your application. You can setup a free account on Fastly and they will give you a dedicated domain to use for targeting the CDN directly. You must have a domain that you own to support this. For example if you're using 

`boutiqe.mydomain.com` 

to point to your demo Boutique application, then adding this domain in fastly will allow you to use 

`boutique.mydomain.com.global.prod.fastly.net`

to access your app as it is served by Fastly's CDN edge. Other CDNs can be used in a similar manner as well.


### Setting Up ThousandEyes Tests
Once the demo app is running you'll want to setup the following tests in ThousandEyes:

1. **Global Page Load Tests** - setup ThousandEyes page load tests from global locations to your origin (ex. `boutique.mydomain.com` or <`frontendservice` public external ip>) as well as to a CDN (ex. `boutique.mydomain.com.global.prod.fastly.net`). This will give you application and network performance and visibility from global vantage points to your application edge and origin. 

2. **Global Synthetic Transaction Tests** - setup ThousandEyes transaction tests to perform a simple user flow: browse, add item to cart, purchase item. This demo includes an example ThousandEyes transaction script - [bouttique-test.js](thousandeyes/tests/boutique-test.js).

3. **Application to Cloud API Tests** - setup ThouandEyes HTTP Server tests from your ThousandEyes Agent running on Kubernetes to backend Cloud API services. Doing this allows you to isolote cloud service performance issues that might be impacting your core application performance. For example, if you depend on **Twilio** for SMS validation or user communication or **Stripe** for payments processing, issues with these Cloud APIs can impact the performance of your application. Create HTTP Server tests to each backend cloud API (ex. `https://api.stripe.com/v1/charges`) and select your ThousandEyes Agent (`te-agent-boutique-0`) as your source agent. You'll start to see HTTP server performance metrics, SSL issues, connection times, as well as full network path visibility from your K8s cluster to your external cloud services.

4. **Bonus - Origin to Edge Performance** - setup periodic HTTP Server or Network tests from your application origin server (your K8s cluster) to your CDN edge nodes. This allows you to understand how your CDN edge network is performing. This is a "bonus" test because the IP addresses of the edge nodes will likely change frequenty. For this reason some automation/scripting is required to periodically capture IPs. The `logiplookup.sh` is an example script that can be used. It parses your Boutique `frontend` service log files for incoming IP requests and then performs a whois lookup on each to determine the provider. This can be used to discover what CDN edge nodes are querying the "origin" server (Boutique application). 
 
You'll need to specify the name of the frontend pod (see `kubectl get pods` above) and the number of unique IPs to look for in the application log.

```bash
./logiplookup.sh frontend-67d5769975-w6llh 100 > ips.txt
```

An example ip lookup might be `157.52.122.21:  Fastly (SKYCA-3)`. To monitor this edge node, setup an HTTP Server or Network Test in ThousandEyes targeting `157.52.122.21` and setting `te-agent-boutique-0` as the source agent. Set the test frequency to something relatively infrequent, like 10 minutes.

While this approach would not typically be used for production monitoring, it illustrates the ability to get better visibility and impact of the Internet on the performance of your CDN and ability for your origin application to serve content to your "Edge". 
 


