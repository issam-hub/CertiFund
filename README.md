# CertiFund

## project setup
### backend:
- enter the backend folder and create `.env` file (see the dissertation for more details)
- on the same folder run `go install` to install go packages (make sure `go` is installed on the machine)
- run `make migrateRun` to run database migrations (make sure `make` tool is installed on the machine, if not, run `sudo apt install make` for linux, for windows, check on it on the net)

### frontend:
- enter the frontend folder and create `.env` file (see the dissertation for more details)
- run `pnpm install` to install the required packages to run the frontend (make sure `pnpm` is installed on the machine, if not, run `curl -fsSL https://get.pnpm.io/install.sh | sh -`)

## running the project
to run the project, do the following:
- enter the backend directory and then run `make build` to build the backend, after that a new file named `api` will be shown under `backend\bin` folder, so we will run it with `./api`
- after running the backend, we go to the frontend directory, and then run `pnpm run dev` to run the project on `development` environment, or `pnpm run build` followed by `pnpm run start` to run the project on `production` environment
