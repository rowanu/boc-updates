#!/usr/bin/env bash
sed "s/INSERT_API/${API_URL:-YOU_FORGOT_API}/g" -i dist/index.html
