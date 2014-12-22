import java.util.Scanner;

class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int counter = scanner.nextInt();
        int number;
        for (int i = 0; i < counter; i++) {
            number = scanner.nextInt();
            System.out.println(number * 2);
        }
    }
}