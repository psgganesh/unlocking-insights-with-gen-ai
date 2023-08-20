#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseInfraStack } from '../lib/database-infra-stack';

const app = new cdk.App();

new DatabaseInfraStack(app, 'mysqldatabase');