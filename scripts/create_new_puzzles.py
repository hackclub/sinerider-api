#!/usr/bin/python3

import requests
import os
import random
from requests.auth import HTTPBasicAuth

PASSWORD = os.getenv('SINERIDER_API_PASSWORD')          # basic http auth password for sinerider-api service

SIMULATE = False                                        # run in simulation mode, showing you what would be done
                                                        # as opposed to doing it

sineriderUrl = "https://sinerider-api.herokuapp.com"

phrases = [
    "Will you be the first to solve it?",
    "Where will you place on the leaderboard?",
    "Play it now!",
    "Share your best solution 💖"
]

msg = random.choice(phrases)

print("Using sinerider URL: %s" % (sineriderUrl))

for i in range(1, 100):
    print("Issuing request #%d..." % (i))
    payload = {
        "id": "puzzle_%d" % (i),
        "title": "The latest and greatest, puzzle #%d!" % (i),
        "description": msg,
        "order": i}

    if SIMULATE:
        print("Would upload payload: %s" % (payload))
    else:
        basic = HTTPBasicAuth('hackclub', PASSWORD)
        response = requests.post('%s/generate' % (sineriderUrl), params=payload, auth=basic)
        print(response.status_code)

    print()
