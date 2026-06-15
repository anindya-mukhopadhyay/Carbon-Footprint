FROM rust:1.87-slim AS build
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src src
RUN cargo build --release

FROM debian:bookworm-slim AS runtime
RUN useradd -m -u 10001 ecotrack
USER ecotrack
WORKDIR /app
COPY --from=build /app/target/release/ecotrack-carbon-core /app/ecotrack-carbon-core
EXPOSE 8090
CMD ["/app/ecotrack-carbon-core"]
