// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core'

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema'

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from './auth'
import dotenv from 'dotenv';

dotenv.config();

const {
  S3_BUCKET_NAME: bucketName = 'keystone-test',
  S3_REGION: region = 'ap-southeast-2',
  S3_ACCESS_KEY_ID: accessKeyId = 'keystone',
  S3_SECRET_ACCESS_KEY: secretAccessKey = 'keystone',
} = process.env;

export default withAuth(
  config({
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: 'postgresql',
      // url: 'file:./keystone.db',
      url: 'postgres://keystoneuser:dbpass@localhost:5432/keystone'
    },
    lists,
    session,
    storage: {
      my_S3_images: {
        kind: 's3',
        type: 'image',
        bucketName,
        region,
        accessKeyId,
        secretAccessKey,
        proxied: { baseUrl: '/images-proxy' },
        signed: { expiry: 5000 },
        endpoint: 'http://127.0.0.1:9000/',
        forcePathStyle: true,
      },
      my_local_images: {
        kind: 'local',
        type: 'image',
        generateUrl: path => `http://localhost:3000/images${path}`,
        serverRoute: {
          path: '/images',
        },
        storagePath: 'public/images',
      },
    },
  })
)
