# About

This exercise will walk you through a scenario of using Amazon Cognito to setup a Web Identity provider (like Amazon or Facebook) and the hosted UI to allow users to authenticate to your new application. We will also show how to create your own UI using the Amazon Cognito API to perform the same function.


# Setup Amazon Cognito user pool and identity pool
The first step in this exercise is to setup the foundational pieces of the Amazon Cognito infrastructure, meaning the User Pool (CUP) and the Identity Pool (CIP), manual instructions or a CloudFormation based intructions are provided.

## Setup - Manual

Follow this steps to manually create the CUP and the CIP:
1. Go to the Amazon Cognito console and click the "Manage User Pools" button
![](images/idna-ex2-manual-img01-cognito.png)
2. Click "Create a user pool"
![](images/idna-ex2-manual-img02-create-pool.png)
3. Name your user pool, for example "idna_workshop_ex2_user_pool_XYZ", where "XYZ" is an unique text for you (username, etc). Then click "Review defaults"
![](images/idna-ex2-manual-img03-name-pool-review-defaults.png)
4. Click "Add app client"
![](images/idna-ex2-manual-img04-add-app-client.png)
5. Click "Add an app client"
![](images/idna-ex2-manual-img05-new-app-client.png)
6. Name your App Client, for example "idna_workshop_ex2_client_XYZ", where "XYZ" is an unique text for you. Then click "Create app client"
![](images/idna-ex2-manual-img06-name-app-client.png)
7. Click "Return to pool details"
![](images/idna-ex2-manual-img07-return-pool-details.png)
8. Click "Create pool"
![](images/idna-ex2-manual-img08-create-pool.png)
9. Once your CUP was create copy the "Pool Id", also go to the "App client settings" under the "App Integration" section to copy the App Client ID (placed under the App Client name)
![](images/idna-ex2-manual-img09-pool-success.png)
![](images/idna-ex2-manual-img09-client-id.png)
10. Click "Federated Identities" next to the AWS logo
![](images/idna-ex2-manual-img10-federated-identities.png)
11. Name your Identity Pool, for example "idna_workshop_ex2_identity_pool_XYZ", where "XYZ" is an unique text for you. Then click "Authentication providers"
![](images/idna-ex2-manual-img11-name-identity-pool.png)
12. Paste the values for the Cognito User Pool that you copied on step 9 and click "Create Pool"
![](images/idna-ex2-manual-img12-set-identity-provider.png)
13. Click "View Details"
![](images/idna-ex2-manual-img13-show-details.png)
14. Click "Edit" to change the policy for authenticated users
![](images/idna-ex2-manual-img14-edit-policy.png)
15. Set the "Action" to "*" and click "Allow"
![](images/idna-ex2-manual-img15-set-action-allow.png)
16. Your Cognito Identity Pool should be ready to use.
![](images/idna-ex2-manual-img16-success.png)


## Setup - Cloud Formation

Follow this steps to create the resources using the provided CloudFormation template:
1. Go to the CloudFormation console and click "Create new stack"
![](images/idna-ex2-cfn-img01-cloudformation.png)
2. Select "Upload a template to Amazon S3", pick the provided template for the exercise 2 (idna_workshop_ex2_cfn.yaml), and click "Next"
![](images/idna-ex2-cfn-img02-choose-template.png)
3. Provide a name for your Stack, for example "iDNA-ex2" and click "Next"
![](images/idna-ex2-cfn-img03-name-stack.png)
4. Click "Next" again
5. Acknowledge that AWS CloudFormation might create IAM resources and click "Create"
![](images/idna-ex2-cfn-img05-ack-create.png)
6. After the Stack is created go to the "Outputs" section of the Stack and note the keys displayed.
![](images/idna-ex2-cfn-img06-check-output.png)


# Setup - Web Identity





# Junk

Domain: https://idna.auth.us-east-1.amazoncognito.com

To Sign In: https://idna.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=1ga8qjvieiuias7h163f4tqp0j&redirect_uri=https://node-alb-one-1981137585.us-east-1.elb.amazonaws.com/api/echo/get



https://your_domain/login?response_type=[code|token]&client_id=your_app_client_id&redirect_uri=your_callback_url

https://node-alb-one-1981137585.us-east-1.elb.amazonaws.com/api/echo/get


URL REQUEST Made usin callback url
