const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const aws = require("aws-sdk")
const multers3 = require("multer-s3")

const MAX_SIZE_TWO_MEGABYTES = 2 * 1024 * 1024

const storageTypes = {
  local: multer.diskStorage({
    destination: (require, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"))
    },
    filename: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err) 
        
        file.key = `${hash.toString("hex")}-${file.originalname}`

        cb(null, file.key)
        
      })
    }
  }),

  s3: multers3({
    s3: new aws.S3(),
    bucket: process.env.BUCKET_NAME,
    contentType: multers3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)

        const filename = `${hash.toString("hex")}-${file.originalname}`

        cb(null, filename)
      })
    }
  })
}

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: MAX_SIZE_TWO_MEGABYTES,
  },
  fileFilter: (request, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  }
}