SHELL := /bin/bash
CFN_TEMPLATE_PATTERN ?= *.template

S3_BUCKET ?= rowanudell-2019-deployment
STACK_PREFIX ?= boc-updates
PARAMETER_SCOPE ?= /boc/updates

# Branch previews are served from the site bucket under updates/previews/
PREVIEW_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD | tr '/' '-')
PREVIEW_PATH := updates/previews/${PREVIEW_BRANCH}
SITE_BUCKET ?= $(shell aws ssm get-parameter --name ${PARAMETER_SCOPE}/site/bucket/name --query Parameter.Value --output text)

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

.PHONY: preview
preview:
	VITE_BASE=/${PREVIEW_PATH}/ NODE_ENV=production npm run build
	aws s3 sync dist/ s3://${SITE_BUCKET}/${PREVIEW_PATH}/ --delete
	aws s3 cp s3://${SITE_BUCKET}/${PREVIEW_PATH}/index.html \
		s3://${SITE_BUCKET}/${PREVIEW_PATH}/index.html --metadata-directive REPLACE --cache-control no-cache
	@echo "Preview: https://bigorange.cloud/${PREVIEW_PATH}/index.html"

.PHONY: preview-clean
preview-clean:
	aws s3 rm --recursive s3://${SITE_BUCKET}/${PREVIEW_PATH}/

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
