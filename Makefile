SHELL := /bin/bash
CFN_TEMPLATE_PATTERN ?= *.template

S3_BUCKET ?= rowanudell-2019-deployment
STACK_PREFIX ?= boc-updates
PARAMETER_SCOPE ?= /boc/updates

# Build functions
FUNCTIONDIRS := $(wildcard functions/*/.)
.PHONY: functions $(FUNCTIONDIRS)
functions: $(FUNCTIONDIRS)
$(FUNCTIONDIRS):
	$(MAKE) -C $@

.PHONY: install
install: functions
	# TODO: Need to install linters e.g. cfn-lint, etc
	npm install

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: test
test:
	npm run test:unit

.PHONY: lint
lint: cfn-lint vue-lint

.PHONY: vue-lint
vue-lint:
	npm run lint

.PHONY: cfn-lint
cfn-lint:
	yamllint --strict ${CFN_TEMPLATE_PATTERN}
	cfn-lint -t ${CFN_TEMPLATE_PATTERN}

.PHONY: data.template
data.template:
	aws cloudformation deploy \
		--stack-name ${STACK_PREFIX}-data \
		--template-file data.template \
		--parameter-overrides \
			ParameterScope=${PARAMETER_SCOPE} \
		--no-fail-on-empty-changeset

.PHONY: scrapers.template
scrapers.template: functions
	aws cloudformation package \
		--template-file $@ \
		--s3-bucket ${S3_BUCKET} \
		--output-template-file $@.out
	aws cloudformation deploy \
		--stack-name ${STACK_PREFIX}-scrapers \
		--template-file $@.out \
		--parameter-overrides \
			ActiveTableName=${PARAMETER_SCOPE}/tables/active/name \
		--capabilities CAPABILITY_IAM \
		--no-fail-on-empty-changeset

.PHONY: api.template
api.template: functions
	aws cloudformation package \
		--template-file $@ \
		--s3-bucket ${S3_BUCKET} \
		--output-template-file $@.out
	aws cloudformation deploy \
		--stack-name ${STACK_PREFIX}-api \
		--template-file $@.out \
		--parameter-overrides \
			ActiveTableName=${PARAMETER_SCOPE}/tables/active/name \
			ParameterScope=${PARAMETER_SCOPE} \
		--capabilities CAPABILITY_IAM \
		--no-fail-on-empty-changeset

.PHONY: site.template
site.template:
	aws cloudformation deploy \
		--stack-name ${STACK_PREFIX}-site \
		--no-fail-on-empty-changeset \
		--template-file site.template

# NOTE: Pipeline must already be deployed with GitHub details
.PHONY: pipeline.template
pipeline.template:
	aws cloudformation deploy \
		--stack-name ${STACK_PREFIX}-pipeline \
		--template-file pipeline.template \
		--parameter-overrides \
			ParameterScope=${PARAMETER_SCOPE} \
			SiteBucketArn=${PARAMETER_SCOPE}/site/bucket/arn \
			SiteBucketName=${PARAMETER_SCOPE}/site/bucket/name \
		--capabilities CAPABILITY_IAM \
		--no-fail-on-empty-changeset
