# Load Test

A load test workflow for Github actions has been defined in the [loadtest.yaml](../.github/workflows/loadtest.yaml) file

## Workflow trigger
The workflow is configured to trigger for any pull request to the `main` branch which is the current default branch of
this repository. Due to a limitation of Github actions, this configuration cannot be automated to point to whatever the 
default branch is. If the repository default branch is renamed, this will also need to be updated in this workflow.

## Load test configuration files

The workflow uses the following additional files for set up located in the [ci](../ci) folder:
* [.env](../ci/.env) : common configuration used in the loadtest workflow and scripts
* [kind-config.yaml](../ci/kind-config.yaml) : configuration for the kind cluster used to set up the kubernetes cluster
                                               for deploying the services for load testing
* [kustomization.yaml](../ci/kustomization.yaml): Kustomization file used to paramaterize the service deployment
* [load-test.js](../ci/load-test.js) : K6 Load test script file
* [service-deployment.yaml](../ci/service-deployment.yaml): kubernetes manifest to deploy the http-echo services to load test

## Load Test workflow
The workflow has the following notable steps
The load test uses Grafana k6 in local run mode using the K6 Github Actions
* `Load Env`: Loads the variables set out in the `ci/.env` file and exposes them as environment variables in the workflow
* `Build docker image`: Builds the docker image for the `http-echo` service using the configured image tag
* `Load Docker Image`: Loads the docker image built on the github runner into the kind cluster to be used by the deployment
* `Deploy echo service`: Uses Kustomize to build the service deployment with the configured image tag and the deploy to the kind cluster
* `Read Load Test Report`: Reads the report text created in the Load test step, and exposes it as a text output variable
                           to be used by the PR comment step.

## Load Test Cluster Configuration
The worklow uses a [KinD](https://kind.sigs.k8s.io/) cluster to the deploy the services to load test. The following
cluster configuration is used:
* 1 master
* 2 workers

Any updates needed can be made to the [kind-config.yaml](../ci/kind-config.yaml) file

## Load Test Script

### SLOs
The following SLOs are configured as thresholds:
* Successful requests rate (availability) >= 95%
* 95% of requests have a response time (p95 latency) < 200ms
* 90% of requests have a response time (p90 latency) < 100ms

In the current load test, lower than real world SLOs are used because of resource restrictions of github hosted runners

### Load Test Stages
The Load test is executed in the following stages:
1. Initial ramp up to 10 virtual users over 5 seconds
2. Secondary ramp up to 80 virtual users over 20 seconds
3. Sustained load with 80 virtual users over 30 seconds
4. Ramp down to 0 virtual users over 5 seconds

### Outputs
The load test result is output to:
1. stdout to be visible in the Github Actions log
2. a text file that can be pasted in a comment to the PR