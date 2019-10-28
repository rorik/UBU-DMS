#!/usr/bin/env python3

from flask import Flask, escape, request, abort
from flask_cors import CORS
from lib.api.restclient import RestClient

rest_client = RestClient()


if __name__ == "__main__":
    print("This is the client")
