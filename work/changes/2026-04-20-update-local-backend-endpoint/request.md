# Request

## Requested Change

Point the local frontend runtime at the local backend endpoint `http://0.0.0.0:8010/contacts`.

## Scope

- update the frontend API base URL
- keep the base URL configurable for other environments
- do not change backend business behavior

## Expected Output

- frontend runtime uses the local backend endpoint by default
- implementation remains overrideable through environment configuration
