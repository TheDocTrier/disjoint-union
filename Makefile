site : clean
	hugo

serve :
	hugo serve -D

.PHONY: clean
clean :
	find docs/ resources/ -mindepth 1 ! -name CNAME -delete || true
