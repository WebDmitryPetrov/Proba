pipeline {
  agent {
    kubernetes {
      yaml """
kind: Pod
apiVersion: v1
metadata:
  name: devops
  labels:
    k8s-app: devops
spec:
  serviceAccountName: jenkins-deploy
  volumes:
    - name: pvc-ce4e7c74-2d55-423c-8edc-87ce4f0f5f2f
      persistentVolumeClaim:
         claimName: my-release-jenkins
    - name: docker-certs
      persistentVolumeClaim:
         claimName: docker-certs-claim
  imagePullSecrets:
    - name: regcred2
  containers:
    - name: jenkins-dind
      image: docker:dind
      ports:
        - name: dind-port
          containerPort: 3000
          protocol: TCP
        - name: sock-port
          containerPort: 2376
          protocol: TCP
      env:
        - name: DOCKER_TLS_CERTDIR
          value: /certs
        - name: REG
          valueFrom:
            secretKeyRef:
              name: reg-token
              key: token
      volumeMounts:
        - name: pvc-ce4e7c74-2d55-423c-8edc-87ce4f0f5f2f
          mountPath: /var/jenkins_home
        - name: docker-certs
          mountPath: /certs/client
      securityContext:
        privileged: true
    - name: test
      image: node:lts-alpine
      env:
      - name: NODE_ENV
        value: test
      command:
        - cat
      tty: true
    - name: deploy
      image: 'cr.yandex/crpudm53vvciv4b12jrt/mykubetest1'
      metadata:
        name: deploy-container
        labels:
          k8s-app: deploy-container
      securityContext:
        privileged: true
      command:
        - cat
      tty: true
"""
    }
  }
  stages {
     stage('test') {
           steps {
            container('test') {
              sh 'npm install'
              // sh 'node node_modules/mocha/bin/mocha --exit tests/'
        }
      }
    }
    stage('build') {
      steps {
        container('jenkins-dind') {
          sh 'docker login --username oauth --password $REG cr.yandex'
          sh 'docker build -t cr.yandex/crpudm53vvciv4b12jrt/test:latest .'
          sh 'docker push cr.yandex/crpudm53vvciv4b12jrt/test:latest'
        }
      }
    }
    stage('deploy') {
      steps {
        container('deploy') {
          sh 'kubectl apply -f App.yaml'
        }
      }
    }
  }
}
