# AdegaTV Live - Roku Channel Packaging
# Requires: Roku SDK (pkger) or Visual Studio Code with Roku extension

CHANNEL_DIR := $(shell pwd)
OUTPUT_DIR := $(CHANNEL_DIR)/dist
CHANNEL_NAME := AdegaTVLive

.PHONY: all clean package install

all: package

clean:
	rm -rf $(OUTPUT_DIR)

package:
	mkdir -p $(OUTPUT_DIR)
	@echo "Creating Roku channel package..."
	@if command -v pkger &> /dev/null; then \
		pkger -o $(OUTPUT_DIR) -n $(CHANNEL_NAME) $(CHANNEL_DIR); \
	else \
		echo "pkger not found. To package manually:"; \
		echo "  1. Zip all files in this directory"; \
		echo "  2. Rename to $(CHANNEL_NAME).zip"; \
		echo "  3. Sign with Roku PKG tool"; \
	fi

install:
	@echo "Install via Roku Developer Settings:"; \
	echo "  1. Open http://ROKU_IP (Settings > Network > About)"; \
	echo "  2. Enable Developer Mode"; \
	echo "  3. Upload the .pkg file"; \
	echo "  4. Restart channel"
