## Running Kubernetes cluster

1. Run kubernetes cluster with minikube

* `minikube start`

2. Use kubectl to manage and interact with your cluster

* `kubectl get nodes` - list nodes in kluster
* `kubectl ` - list nodes in kluster
* `kubectl create deployment <tag> <image>` - deploy image to cluster
* `kubectl get deployments` - get list of deployments
* `kubectl proxy` - start proxy to directly access kubernetes API
* `kubectl get pods` - list running pods
* `kubectl logs ` - view container logs
* `kubectl exec -it -c <container name> <pod name> <command>` - execute a command in interactive terminal with stdin attached
* `kubectl get <resource name>` - get info about specified resource
* `kubectl describe <resource name>` - get details about resource ex: pod, node , deployment
* `curl http://localhost:8001/api/v1/namespaces/default/pods/<POD_NAME>/proxy/` - route to pod API
* `kubectl expose deployments/<your deployment> --type=<service type> --port <app port>`- create service
* `kubectl label pod <custom label> app=v1` - set new label for pod
* `kubectl get rs` - get replica set
* `kubectl scale deployments/<your deployment> --replicas=n` - scale your deployment to 4 replicas
* `kubectl get pods -o wide` - info about pods and their replicas
* `kubectl run webui-service --image=webui-service --image-pull-policy=Never` - create pod from local docker registry
* `kubectl set image deployments/<your deployment> <previous image> = <updated name>` - set new image for deployment
* `kubectl rollout undo deployments/<your deployment>` - undo last changes
* `kubectl create secret generic <secret name> --from-file=.dockerconfigjson=<absolute path to config.json> --type=kubernetes.io/dockerconfigjson` - create secret for docker registry (need to login first)
* `kubectl get secret ss-secret --output=yaml` - check that secret is created and show it props in yaml format
* `docker build . -t cr.yandex/<repo id>/<image tag>` - build docker image for cr.yandex registry
* `docker push cr.yandex/<repo id>/<image tag>` - push built docker image to registry

## Run Kubernetes web ui
* At first we need to create user (kubernetes service account) to access UI
```apiVersion: v1 
 kind: ServiceAccount
 metadata:
   name: admin
   namespace: kubernetes-dashboard
```
* Next we need to assign cluster role 'cluster-admin' to our newly creatd user.
It will give our user admin right on cluster level.
```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin
# description of role to be assigned:
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
# subjects : list of users role to be assigned to:
subjects:
- kind: ServiceAccount
  name: admin
  namespace: kubernetes-dashboard
```
* Now lets get our token which will be used to access Kubernetes UI
```
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
```
* Let's get down to business: start Kubernetes Web UI:
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recommended.yaml
```
In case of any errors like "server is not reachable" etc... use 
```
curl https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recommended.yaml >> kubeui.yaml
kubectl apply -f ./kubeui.yaml
```
* Run kubectl proxy on your host to expose UI
```
kubectl proxy
```

You'll see something like this:

```
Starting to serve on 127.0.0.1:8001
```

* Use SSH port forwarding to access port 127.0.0.1:8001 127.0.0.1 is ususally reffered as localhost.
On your local workstation run:
```
ssh -L <local port to use>:<ip on remote host>:<port on remote host> <username>@<host ip>

example:

ssh -L 8000:127.0.0.1:8001 username@192.168.0.1
```
* Use next url with port you specified for previous command to access Kubernetes UI from your local browser
```
http://localhost:<local port you specified for ssh>/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/.
```

## Devops
* Install Helm
```
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```
* Install Jenkins
```
helm install stable/jenkins --version 1.16.0
```
* Docker image builder config
1. We need docker:dind image
2. Configure container to have access to ya repo
create secret:
```
echo -n '<token>' | base64
```
use yaml for secret
3. configure nginx container to run kubectl (local or in pod)
inside nginx:latest container run next commands:
```
apt-get update
apt-get install curl
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod +x ./kubectl
mv ./kubectl /usr/local/bin/kubectl
```
after nginx container is modified go back to docker host and enter:
```
docker commit <nginx running container name>
you will get smth like : SHA2: <image digest>
docker tag <image digest> <path to registry>/<new tag name>
docker push  <path to registry>/<new tag name>
```
4. Prepare Jenkins and Docker files for your app + prepare App.yaml


