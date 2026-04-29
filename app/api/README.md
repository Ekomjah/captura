> Check out `todo comments` in `models.model`,`schema.db_schema` and `main.py` and suggest possible workarounds for these concerns

Installing the Better Comments VSCode Extension by Aaron Bond will be helpful to easily eyespot them. Search [aaron-bond.better-comments] in Vscode Extensions

The backend runs using a half-docker + uv setup

- To begin contributions, fill your env vars to match the .env.example sample
- `cd` into app/api and run `uv sync`,then, `docker compose up` and then wait for the postgres image to be pulled.
- Upon confirmation of a healthy and running container using `docker ps`, run `docker compose exec db psql -U captura-developer -d captura_db` to begin your database and `alembic revision --autogenerate -m "description of changes"` to instanstiate the db.
- Check for `op.check_table(...)` in the `upgrade` fn in the file this command generated in alembic/revisions to confirm everything is in order
- Run `alembic upgrade head` to create a table
- Run `uvicorn main:app --reload` to begin testing this project
