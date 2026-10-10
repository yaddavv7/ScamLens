from url_analyzer import analyze_urls


message = """
URGENT! Your bank account will be blocked.
Verify your account here:
https://secure-bank-verification-example.com/login
"""


results = analyze_urls(message)


for result in results:

    print("\n==============================")

    print("URL:")
    print(result["url"])

    print("\nDomain:")
    print(result["domain"])

    print("\nRisk:")
    print(result["risk"])

    print("\nScore:")
    print(result["score"])

    print("\nIndicators:")

    for indicator in result["indicators"]:

        print(
            "-",
            indicator["category"],
            ":",
            indicator["message"]
        )

    print("==============================")
