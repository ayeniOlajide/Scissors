const { createClient } = require("redis");
const hash = require("object-hash");

// initialize the Redis client variable
let redisClient = undefined;

async function initializeRedisClient() {
  let redisURL = process.env.REDIS_URI;
  if (redisURL) {
    redisClient = createClient({ url: redisURL }).on("error", (e) => {
      console.error(`Failed to create the Redis client with error:`);
      console.error(e);
    });

    try {
      await redisClient.connect();
      console.log(`Connected to Redis successfully!`);
    } catch (e) {
      console.error(`Connection to Redis failed with error:`);
      console.error(e);
    }
  }
}

function requestToKey(req) {
  const reqDataToHash = {
    query: req.query,
    body: req.body,
  };
  return `${req.path}@${hash.sha1(reqDataToHash)}`;
}

function isRedisWorking() {
  return !!redisClient?.isOpen;
}

async function writeData(key, data, options) {
  if (isRedisWorking()) {
    try {
      await redisClient.set(key, data, options);
    } catch (e) {
      console.error(`Failed to cache data for key=${key}`, e);
    }
  }
}

async function readData(key) {
  if (isRedisWorking()) {
    return await redisClient.get(key);
  }
  return undefined;
}

function redisCachingMiddleware(
  options = {
    EX: 21600, // 6h
  }
) {
  return async (req, res, next) => {
    if (isRedisWorking()) {
      const key = requestToKey(req);
      const cachedValue = await readData(key);
      if (cachedValue) {
        try {
          return res.json(JSON.parse(cachedValue));
        } catch {
          return res.send(cachedValue);
        }
      } else {
        const oldSend = res.send;
        res.send = function (data) {
          res.send = oldSend;
          if (res.statusCode.toString().startsWith("2")) {
            writeData(key, data, options).then();
          }
          return res.send(data);
        };
        next();
      }
    } else {
      next();
    }
  };
}

module.exports = { initializeRedisClient, redisCachingMiddleware };
