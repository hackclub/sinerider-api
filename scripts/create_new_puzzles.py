#!/usr/bin/python3

import requests
import os
from requests.auth import HTTPBasicAuth

PASSWORD = os.getenv('SINERIDER_API_PASSWORD')          # basic http auth password for sinerider-api service

SIMULATE = True                                         # run in simulation mode, showing you what would be done
                                                        # as opposed to doing it

sineriderUrl = "https://sinerider-api.herokuapp.com"

print ("Using sinerider URL: %s" % (sineriderUrl))

for i in range(1, 100):
    print("Issuing request #%d..." % (i))
    payload = {
        "id": "puzzle_%d" % (i),
        "title": "Daily Puzzle #%d" % (i),
        "description": "The latest and greatest puzzle #%d!" % (i),
        "order": i}

    if SIMULATE:
        print("Would upload payload: %s" % (payload))
    else:
        basic = HTTPBasicAuth('hackclub', PASSWORD)
        response = requests.post('%s/generate' % (sineriderUrl), params=payload, auth=basic)
        print(response.status_code)

    print()
