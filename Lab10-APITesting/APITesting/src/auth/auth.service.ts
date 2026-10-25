import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, password } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            throw new ConflictException('User with this username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await this.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: registerDto.role || Role.USER,
            },
        });

        return {
            message: 'User registered successfully',
            user: {
                id: user.uid,
                username: user.username,
                role: user.role,
            },
        };
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.uid, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            message: 'Login successful',
        };
    }
}
